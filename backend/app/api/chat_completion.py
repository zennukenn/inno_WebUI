from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json
import time
import uuid
import logging

from app.database import get_db
from app.services.chat_service import ChatService
from app.services.vllm_service import vllm_service, VLLMService
from app.schemas.chat import ChatCompletionRequest, MessageCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat_completion"])

@router.post("/completion")
async def chat_completion(
    request: ChatCompletionRequest,
    db: Session = Depends(get_db),
    user_id: str = "default_user"
):
    """Handle chat completion request"""
    try:
        logger.info(f"🚀 [DEBUG] Chat completion request received:")
        logger.info(f"  - Model: {request.model}")
        logger.info(f"  - VLLM URL: {request.vllm_url}")
        logger.info(f"  - Messages count: {len(request.messages)}")
        logger.info(f"  - Temperature: {request.temperature}")
        logger.info(f"  - Max tokens: {request.max_tokens}")
        logger.info(f"  - Stream: {request.stream}")

        chat_service = ChatService(db)

        # Get VLLM configuration from request or use default
        if request.vllm_url:
            logger.info(f"🔧 [DEBUG] Using custom VLLM service: {request.vllm_url}")
            current_vllm_service = VLLMService(request.vllm_url, request.vllm_api_key)
        else:
            logger.info(f"🔧 [DEBUG] Using default VLLM service")
            current_vllm_service = vllm_service

        # Note: User message is already saved by the frontend via addMessage API
        # We only need to save the assistant's response here

        if request.stream:
            # Streaming response
            async def generate():
                assistant_content = ""
                assistant_message_id = str(uuid.uuid4())
                
                try:
                    logger.info("🔄 [DEBUG] Starting VLLM stream processing...")
                    chunk_count = 0

                    async for chunk in current_vllm_service.chat_completion_stream(request):
                        chunk_count += 1
                        logger.debug(f"📦 [DEBUG] Processing chunk {chunk_count}: {chunk[:100]}...")

                        # Parse the chunk to extract content
                        if chunk.startswith("data: "):
                            try:
                                data = json.loads(chunk[6:])
                                if "choices" in data and len(data["choices"]) > 0:
                                    delta = data["choices"][0].get("delta", {})
                                    if "content" in delta:
                                        content = delta["content"]
                                        assistant_content += content

                                        # Add message_id to the response
                                        data["message_id"] = assistant_message_id
                                        yield f"data: {json.dumps(data)}\n\n"
                            except json.JSONDecodeError as json_error:
                                logger.warning(f"⚠️ [DEBUG] JSON decode error: {json_error}, chunk: {chunk[:100]}")
                                continue
                        else:
                            yield chunk

                    logger.info(f"✅ [DEBUG] Stream processing completed. Chunks processed: {chunk_count}, Content length: {len(assistant_content)}")

                    # Save assistant message after streaming is complete
                    if request.chat_id and assistant_content:
                        assistant_msg_data = MessageCreate(
                            role="assistant",
                            content=assistant_content,
                            timestamp=int(time.time())
                        )
                        chat_service.add_message_to_chat(request.chat_id, assistant_msg_data, user_id)
                        logger.info(f"💾 [DEBUG] Assistant message saved to chat {request.chat_id}")

                    yield "data: [DONE]\n\n"

                except Exception as e:
                    logger.error(f"❌ [DEBUG] Stream processing error: {e}")
                    logger.error(f"❌ [DEBUG] Error type: {type(e).__name__}")
                    logger.error(f"❌ [DEBUG] Error details: {str(e)}")

                    error_response = {
                        "error": {
                            "message": str(e),
                            "type": "stream_error",
                            "details": f"{type(e).__name__}: {str(e)}"
                        }
                    }
                    yield f"data: {json.dumps(error_response)}\n\n"

            return StreamingResponse(
                generate(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                }
            )
        else:
            # Non-streaming response
            response = await current_vllm_service.chat_completion(request)
            
            # Save assistant message
            if request.chat_id and "choices" in response and len(response["choices"]) > 0:
                assistant_content = response["choices"][0]["message"]["content"]
                assistant_msg_data = MessageCreate(
                    role="assistant",
                    content=assistant_content,
                    timestamp=int(time.time())
                )
                chat_service.add_message_to_chat(request.chat_id, assistant_msg_data, user_id)
            
            return response
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models")
async def get_models():
    """Get available models from VLLM"""
    try:
        models = await vllm_service.get_models()
        return {"data": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Check VLLM service health"""
    try:
        is_healthy = await vllm_service.health_check()
        if is_healthy:
            return {"status": "healthy"}
        else:
            raise HTTPException(status_code=503, detail="VLLM service unavailable")
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.post("/test-connection")
async def test_vllm_connection(request: dict):
    """Test VLLM connection with custom URL"""
    try:
        vllm_url = request.get("vllm_url")
        api_key = request.get("api_key")

        if not vllm_url:
            raise HTTPException(status_code=400, detail="VLLM URL is required")

        # Create a temporary VLLM service instance for testing
        test_service = VLLMService(vllm_url, api_key)

        # Test connection by getting models
        models = await test_service.get_models()
        is_healthy = await test_service.health_check()

        return {
            "connected": is_healthy,
            "models": models,
            "message": "Connection successful" if is_healthy else "Connection failed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_connection_status():
    """Get comprehensive connection status"""
    from app.database import get_db
    from sqlalchemy.exc import SQLAlchemyError
    import time

    status = {
        "timestamp": int(time.time()),
        "backend": {
            "status": "healthy",
            "message": "Backend service is running"
        },
        "database": {
            "status": "unknown",
            "message": ""
        },
        "vllm": {
            "status": "unknown",
            "message": "",
            "models": []
        },
        "overall": "unknown"
    }

    # Test database connection
    try:
        db = next(get_db())
        # Try a simple query to test connection
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        status["database"]["status"] = "healthy"
        status["database"]["message"] = "Database connection successful"
        db.close()
    except SQLAlchemyError as e:
        status["database"]["status"] = "error"
        status["database"]["message"] = f"Database connection failed: {str(e)}"
    except Exception as e:
        status["database"]["status"] = "error"
        status["database"]["message"] = f"Database error: {str(e)}"

    # Test VLLM connection
    try:
        is_healthy = await vllm_service.health_check()
        if is_healthy:
            status["vllm"]["status"] = "healthy"
            status["vllm"]["message"] = "VLLM service is available"
            try:
                models = await vllm_service.get_models()
                status["vllm"]["models"] = models
            except:
                status["vllm"]["models"] = []
        else:
            status["vllm"]["status"] = "error"
            status["vllm"]["message"] = "VLLM service is not responding"
    except Exception as e:
        status["vllm"]["status"] = "error"
        status["vllm"]["message"] = f"VLLM connection failed: {str(e)}"

    # Determine overall status
    if (status["backend"]["status"] == "healthy" and
        status["database"]["status"] == "healthy" and
        status["vllm"]["status"] == "healthy"):
        status["overall"] = "healthy"
    elif status["backend"]["status"] == "healthy" and status["database"]["status"] == "healthy":
        status["overall"] = "partial"  # Backend and DB work, but VLLM might be down
    else:
        status["overall"] = "error"

    return status
