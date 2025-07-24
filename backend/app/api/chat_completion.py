from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json
import time
import uuid

from app.database import get_db
from app.services.chat_service import ChatService
from app.services.vllm_service import vllm_service, VLLMService
from app.schemas.chat import ChatCompletionRequest, MessageCreate

router = APIRouter(prefix="/chat", tags=["chat_completion"])

@router.post("/completion")
async def chat_completion(
    request: ChatCompletionRequest,
    db: Session = Depends(get_db),
    user_id: str = "default_user"
):
    """Handle chat completion request"""
    try:
        chat_service = ChatService(db)

        # Get VLLM configuration from request or use default
        if request.vllm_url:
            current_vllm_service = VLLMService(request.vllm_url, request.vllm_api_key)
        else:
            current_vllm_service = vllm_service

        # Note: User message is already saved by the frontend via addMessage API
        # We only need to save the assistant's response here

        if request.stream:
            # Streaming response
            async def generate():
                assistant_content = ""
                assistant_message_id = str(uuid.uuid4())
                
                try:
                    async for chunk in current_vllm_service.chat_completion_stream(request):
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
                            except json.JSONDecodeError:
                                continue
                        else:
                            yield chunk
                    
                    # Save assistant message after streaming is complete
                    if request.chat_id and assistant_content:
                        assistant_msg_data = MessageCreate(
                            role="assistant",
                            content=assistant_content,
                            timestamp=int(time.time())
                        )
                        chat_service.add_message_to_chat(request.chat_id, assistant_msg_data, user_id)
                    
                    yield "data: [DONE]\n\n"
                    
                except Exception as e:
                    error_response = {
                        "error": {
                            "message": str(e),
                            "type": "api_error"
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
