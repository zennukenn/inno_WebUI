from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import aiohttp
import asyncio
from app.config import settings
from app.services.vllm_service import vllm_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/models", tags=["models"])

class ModelInfo(BaseModel):
    id: str
    object: str = "model"
    created: int
    owned_by: str = "vllm"
    permission: List[Dict[str, Any]] = []
    root: Optional[str] = None
    parent: Optional[str] = None

class ModelListResponse(BaseModel):
    object: str = "list"
    data: List[ModelInfo]

class ModelConfig(BaseModel):
    model_name: str
    api_base: str
    api_key: Optional[str] = None
    max_tokens: int = 2048
    temperature: float = 0.7
    top_p: float = 1.0
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0

# 存储用户配置的模型
user_models: Dict[str, ModelConfig] = {}

@router.get("/", response_model=ModelListResponse)
async def list_models():
    """获取可用模型列表"""
    try:
        # 从VLLM获取模型
        vllm_models = await vllm_service.get_models()
        
        # 转换为标准格式
        models = []
        for model in vllm_models:
            models.append(ModelInfo(
                id=model.get("id", "unknown"),
                created=model.get("created", 0),
                owned_by=model.get("owned_by", "vllm")
            ))
        
        # 添加用户配置的模型
        for model_id, config in user_models.items():
            models.append(ModelInfo(
                id=model_id,
                created=0,
                owned_by="user"
            ))
        
        # 如果没有模型，添加默认模型
        if not models:
            models.append(ModelInfo(
                id="default",
                created=0,
                owned_by="vllm"
            ))
        
        return ModelListResponse(data=models)
        
    except Exception as e:
        logger.error(f"Error listing models: {e}")
        # 返回默认模型
        return ModelListResponse(data=[
            ModelInfo(
                id="default",
                created=0,
                owned_by="vllm"
            )
        ])

@router.post("/add")
async def add_model(config: ModelConfig):
    """添加自定义模型配置"""
    try:
        # 验证模型连接
        test_url = f"{config.api_base.rstrip('/')}/models"
        headers = {}
        if config.api_key:
            headers["Authorization"] = f"Bearer {config.api_key}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(test_url, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status != 200:
                    raise HTTPException(status_code=400, detail=f"Cannot connect to model API: {response.status}")
        
        # 保存模型配置
        user_models[config.model_name] = config
        
        return {"message": f"Model {config.model_name} added successfully"}
        
    except aiohttp.ClientError as e:
        raise HTTPException(status_code=400, detail=f"Connection error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding model: {str(e)}")

@router.delete("/{model_id}")
async def remove_model(model_id: str):
    """删除自定义模型配置"""
    if model_id in user_models:
        del user_models[model_id]
        return {"message": f"Model {model_id} removed successfully"}
    else:
        raise HTTPException(status_code=404, detail="Model not found")

@router.get("/{model_id}/config")
async def get_model_config(model_id: str):
    """获取模型配置"""
    if model_id in user_models:
        return user_models[model_id]
    else:
        # 返回默认配置
        return ModelConfig(
            model_name=model_id,
            api_base=settings.VLLM_API_BASE_URL,
            api_key=settings.VLLM_API_KEY,
            max_tokens=2048,
            temperature=0.7
        )

@router.post("/{model_id}/test")
async def test_model(model_id: str):
    """测试模型连接"""
    try:
        config = user_models.get(model_id)
        if not config:
            # 使用默认VLLM配置
            test_url = f"{settings.VLLM_API_BASE_URL}/models"
            headers = {}
            if settings.VLLM_API_KEY:
                headers["Authorization"] = f"Bearer {settings.VLLM_API_KEY}"
        else:
            test_url = f"{config.api_base.rstrip('/')}/models"
            headers = {}
            if config.api_key:
                headers["Authorization"] = f"Bearer {config.api_key}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(test_url, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "status": "success",
                        "message": "Model connection successful",
                        "models": data.get("data", [])
                    }
                else:
                    return {
                        "status": "error",
                        "message": f"Connection failed: HTTP {response.status}"
                    }
                    
    except Exception as e:
        return {
            "status": "error",
            "message": f"Connection error: {str(e)}"
        }
