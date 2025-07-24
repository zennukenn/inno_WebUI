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
    def __init__(self):
        self.base_url = settings.VLLM_API_BASE_URL.rstrip('/')
        self.api_key = settings.VLLM_API_KEY
        self.headers = {
            "Content-Type": "application/json"
        }
        if self.api_key:
            self.headers["Authorization"] = f"Bearer {self.api_key}"

        # Default model configuration
        self.default_model = settings.DEFAULT_MODEL
        self.timeout = aiohttp.ClientTimeout(total=300)  # 5 minutes timeout

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

    async def chat_completion(self, request: ChatCompletionRequest) -> Dict[str, Any]:
        """Send chat completion request to VLLM"""
        # 获取模型配置
        model = request.model if request.model else self.default_model
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
        # 获取模型配置
        model = request.model if request.model else self.default_model
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
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"VLLM API error: {response.status} - {error_text}")
                        raise Exception(f"VLLM API error: {response.status} - {error_text}")

                    # Read streaming response line by line
                    async for line in response.content:
                        line = line.decode('utf-8').strip()
                        if line.startswith('data: '):
                            data = line[6:]  # Remove 'data: ' prefix
                            if data == '[DONE]':
                                break
                            try:
                                chunk = json.loads(data)
                                yield f"data: {json.dumps(chunk)}\n\n"
                            except json.JSONDecodeError:
                                continue
        except aiohttp.ClientError as e:
            logger.error(f"VLLM streaming connection error: {e}")
            raise Exception(f"Failed to connect to VLLM service: {e}")
        except asyncio.TimeoutError:
            logger.error("VLLM streaming request timeout")
            raise Exception("VLLM streaming request timeout")

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
