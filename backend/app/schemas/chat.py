from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class MessageCreate(BaseModel):
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    parent_id: Optional[str] = Field(None, description="Parent message ID")
    timestamp: Optional[int] = Field(None, description="Message timestamp")

class MessageResponse(BaseModel):
    id: str
    chat_id: str
    parent_id: Optional[str]
    role: str
    content: str
    model: Optional[str]
    timestamp: int
    metadata: Dict[str, Any]
    created_at: Optional[str]
    updated_at: Optional[str]

class ChatCreate(BaseModel):
    title: Optional[str] = Field("New Chat", description="Chat title")
    model: Optional[str] = Field(None, description="Model name")
    system_prompt: Optional[str] = Field(None, description="System prompt")
    temperature: Optional[float] = Field(0.7, description="Temperature setting")
    max_tokens: Optional[int] = Field(2048, description="Max tokens")

class ChatUpdate(BaseModel):
    title: Optional[str] = None
    model: Optional[str] = None
    system_prompt: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    messages: Optional[List[Dict[str, Any]]] = None
    archived: Optional[bool] = None

class ChatResponse(BaseModel):
    id: str
    title: str
    user_id: str
    model: Optional[str]
    system_prompt: Optional[str]
    temperature: Optional[float]
    max_tokens: Optional[int]
    messages: List[Dict[str, Any]]
    created_at: Optional[str]
    updated_at: Optional[str]
    archived: bool

class ChatListResponse(BaseModel):
    id: str
    title: str
    created_at: Optional[str]
    updated_at: Optional[str]

class ChatCompletionRequest(BaseModel):
    model: str = Field(..., description="Model name (required)")
    messages: List[Dict[str, str]] = Field(..., description="Chat messages")
    temperature: Optional[float] = Field(0.7, description="Temperature")
    max_tokens: Optional[int] = Field(2048, description="Max tokens")
    stream: Optional[bool] = Field(False, description="Stream response")
    chat_id: Optional[str] = Field(None, description="Chat ID")
    message_id: Optional[str] = Field(None, description="Message ID")
    # Dynamic VLLM configuration
    vllm_url: Optional[str] = Field(None, description="VLLM API URL")
    vllm_api_key: Optional[str] = Field(None, description="VLLM API Key")

class ChatCompletionResponse(BaseModel):
    id: str
    object: str = "chat.completion"
    created: int
    model: str
    choices: List[Dict[str, Any]]
    usage: Optional[Dict[str, int]] = None
