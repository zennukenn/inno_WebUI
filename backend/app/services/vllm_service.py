import asyncio
import json
import time
from typing import AsyncGenerator, Dict, Any, List
import aiohttp
from app.config import settings
from app.schemas.chat import ChatCompletionRequest
import logging

logger = logging.getLogger(__name__)

class VLLMService:
    def __init__(self, base_url=None, api_key=None):
        self.base_url = (base_url or settings.VLLM_API_BASE_URL).rstrip('/')
        self.api_key = api_key or settings.VLLM_API_KEY
        self.headers = {
            "Content-Type": "application/json"
        }
        if self.api_key:
            self.headers["Authorization"] = f"Bearer {self.api_key}"

        # Default model configuration
        self.default_model = settings.DEFAULT_MODEL  # Will be empty string, auto-selected later
        self.timeout = aiohttp.ClientTimeout(total=300)  # 5 minutes timeout

        # Initialize custom models storage
        self.custom_models = {}

    def update_config(self, base_url=None, api_key=None):
        """Update VLLM service configuration"""
        if base_url:
            self.base_url = base_url.rstrip('/')
        if api_key:
            self.api_key = api_key
            self.headers["Authorization"] = f"Bearer {api_key}"
        elif api_key == "":  # Explicitly remove API key
            self.headers.pop("Authorization", None)

        # 存储自定义模型配置
        self.custom_models = {}

    def add_custom_model(self, model_id: str, api_base: str, api_key: str = None):
        """添加自定义模型配置"""
        self.custom_models[model_id] = {
            "api_base": api_base.rstrip('/'),
            "api_key": api_key
        }

    def get_model_config(self, model_id: str):
        """获取模型配置"""
        if model_id in self.custom_models:
            return self.custom_models[model_id]
        return {
            "api_base": self.base_url,
            "api_key": self.api_key
        }

    async def get_available_models(self) -> List[str]:
        """Get list of available models from VLLM"""
        url = f"{self.base_url}/models"
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        models = [model["id"] for model in data.get("data", [])]
                        return models
                    else:
                        logger.error(f"Failed to get models: {response.status}")
                        return []
        except Exception as e:
            logger.error(f"Error getting models: {e}")
            return []

    async def get_default_model(self) -> str:
        """Get the first available model as default"""
        if self.default_model:
            return self.default_model

        models = await self.get_available_models()
        if models:
            return models[0]
        else:
            raise Exception("No models available from VLLM service")

    async def chat_completion(self, request: ChatCompletionRequest) -> Dict[str, Any]:
        """Send chat completion request to VLLM"""
        # 使用请求中的模型名称（现在是必需的）
        model = request.model
        logger.info(f"🤖 [DEBUG] Using model: {model}")

        # 验证模型是否存在
        available_models = await self.get_available_models()
        if available_models and model not in available_models:
            logger.warning(f"⚠️ [DEBUG] Model '{model}' not found in available models: {available_models}")
            # 如果模型不存在，尝试使用第一个可用模型
            if available_models:
                fallback_model = available_models[0]
                logger.info(f"🔄 [DEBUG] Using fallback model: {fallback_model}")
                model = fallback_model
            else:
                raise Exception(f"Model '{request.model}' not found and no fallback models available")

        model_config = self.get_model_config(model)
        logger.info(f"🔧 [DEBUG] Model config: {model_config}")

        url = f"{model_config['api_base']}/chat/completions"
        logger.info(f"🌐 [DEBUG] VLLM URL: {url}")

        # 准备请求头
        headers = {"Content-Type": "application/json"}
        if model_config['api_key']:
            headers["Authorization"] = f"Bearer {model_config['api_key'][:10]}..."
            logger.info(f"🔑 [DEBUG] Using API key (first 10 chars): {model_config['api_key'][:10]}...")
        else:
            logger.info(f"🔑 [DEBUG] No API key configured")

        # Prepare payload with proper model handling and token management
        max_tokens = request.max_tokens or 1024

        # 确保max_tokens不会超过模型的上下文限制
        # 为输入消息预留空间，估算输入token数量
        estimated_input_tokens = sum(len(msg["content"].split()) * 1.3 for msg in request.messages)
        safe_max_tokens = min(max_tokens, max(100, 1800 - int(estimated_input_tokens)))

        payload = {
            "model": model,
            "messages": request.messages,
            "temperature": request.temperature or 0.7,
            "max_tokens": safe_max_tokens,
            "stream": False
        }

        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        error_text = await response.text()
                        logger.error(f"VLLM API error: {response.status} - {error_text}")
                        raise Exception(f"VLLM API error: {response.status} - {error_text}")
        except aiohttp.ClientError as e:
            logger.error(f"VLLM connection error: {e}")
            raise Exception(f"Failed to connect to VLLM service: {e}")
        except asyncio.TimeoutError:
            logger.error("VLLM request timeout")
            raise Exception("VLLM request timeout")

    async def chat_completion_stream(self, request: ChatCompletionRequest) -> AsyncGenerator[str, None]:
        """Send streaming chat completion request to VLLM"""
        # 使用请求中的模型名称（现在是必需的）
        model = request.model
        logger.info(f"🤖 [DEBUG] Streaming with model: {model}")

        # 验证模型是否存在
        available_models = await self.get_available_models()
        if available_models and model not in available_models:
            logger.warning(f"⚠️ [DEBUG] Model '{model}' not found in available models: {available_models}")
            # 如果模型不存在，尝试使用第一个可用模型
            if available_models:
                fallback_model = available_models[0]
                logger.info(f"🔄 [DEBUG] Using fallback model: {fallback_model}")
                model = fallback_model
            else:
                raise Exception(f"Model '{request.model}' not found and no fallback models available")

        model_config = self.get_model_config(model)

        url = f"{model_config['api_base']}/chat/completions"

        # 准备请求头
        headers = {"Content-Type": "application/json"}
        if model_config['api_key']:
            headers["Authorization"] = f"Bearer {model_config['api_key']}"

        # Prepare payload with proper model handling and token management
        max_tokens = request.max_tokens or 1024

        # 确保max_tokens不会超过模型的上下文限制
        # 为输入消息预留空间，估算输入token数量
        estimated_input_tokens = sum(len(msg["content"].split()) * 1.3 for msg in request.messages)
        safe_max_tokens = min(max_tokens, max(100, 1800 - int(estimated_input_tokens)))

        payload = {
            "model": model,
            "messages": request.messages,
            "temperature": request.temperature or 0.7,
            "max_tokens": safe_max_tokens,
            "stream": True
        }

        try:
            logger.info(f"🔗 [DEBUG] Connecting to VLLM stream at: {url}")
            logger.info(f"📋 [DEBUG] Stream payload: {json.dumps(payload, indent=2)}")

            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.post(url, json=payload, headers=headers) as response:
                    logger.info(f"📡 [DEBUG] VLLM stream response status: {response.status}")

                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"❌ [DEBUG] VLLM API error: {response.status} - {error_text}")
                        raise Exception(f"VLLM API error: {response.status} - {error_text}")

                    logger.info("✅ [DEBUG] VLLM stream connection established, reading response...")
                    line_count = 0

                    # Read streaming response line by line
                    async for line in response.content:
                        line_count += 1
                        line = line.decode('utf-8').strip()

                        if line_count <= 5:  # Log first few lines for debugging
                            logger.debug(f"📄 [DEBUG] Line {line_count}: {line[:100]}...")

                        if line.startswith('data: '):
                            data = line[6:]  # Remove 'data: ' prefix
                            if data == '[DONE]':
                                logger.info("🏁 [DEBUG] Received [DONE] from VLLM")
                                break
                            try:
                                chunk = json.loads(data)
                                yield f"data: {json.dumps(chunk)}\n\n"
                            except json.JSONDecodeError as json_error:
                                logger.warning(f"⚠️ [DEBUG] JSON decode error in VLLM response: {json_error}, data: {data[:100]}")
                                continue

                    logger.info(f"✅ [DEBUG] VLLM stream completed. Total lines processed: {line_count}")

        except aiohttp.ClientError as e:
            logger.error(f"❌ [DEBUG] VLLM streaming connection error: {e}")
            logger.error(f"❌ [DEBUG] Connection details - URL: {url}, Timeout: {self.timeout}")
            raise Exception(f"Failed to connect to VLLM service: {e}")
        except asyncio.TimeoutError:
            logger.error(f"❌ [DEBUG] VLLM streaming request timeout (timeout: {self.timeout})")
            raise Exception(f"VLLM streaming request timeout after {self.timeout} seconds")
        except Exception as e:
            logger.error(f"❌ [DEBUG] Unexpected error in VLLM streaming: {type(e).__name__}: {e}")
            raise Exception(f"VLLM streaming error: {e}")

    async def get_models(self) -> List[Dict[str, Any]]:
        """Get available models from VLLM"""
        url = f"{self.base_url}/models"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=self.headers) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('data', [])
                else:
                    logger.error(f"Failed to get models: {response.status}")
                    return []

    async def health_check(self) -> bool:
        """Check if VLLM service is healthy"""
        try:
            url = f"{self.base_url}/models"
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, timeout=aiohttp.ClientTimeout(total=5)) as response:
                    return response.status == 200
        except Exception as e:
            logger.error(f"VLLM health check failed: {e}")
            return False

# Global VLLM service instance
vllm_service = VLLMService()
