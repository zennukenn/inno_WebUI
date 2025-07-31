from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.services.chat_service import ChatService
from app.schemas.chat import (
    ChatCreate, ChatUpdate, ChatResponse, ChatListResponse,
    MessageCreate, MessageResponse
)

router = APIRouter(prefix="/chats", tags=["chats"])

@router.post("/", response_model=ChatResponse)
async def create_chat(
    chat_data: ChatCreate,
    db: Session = Depends(get_db),
    user_id: str = "default_user"
):
    """Create a new chat"""
    chat_service = ChatService(db)
    chat = await chat_service.create_chat(chat_data, user_id)
    return ChatResponse(**chat.to_dict())

@router.get("/", response_model=List[ChatListResponse])
async def get_chats(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user_id: str = "default_user"
):
    """Get all chats for user"""
    chat_service = ChatService(db)
    chats = chat_service.get_chats(user_id, limit, offset)
    return [
        ChatListResponse(
            id=chat.id,
            title=chat.title,
            created_at=chat.to_dict()["created_at"],
            updated_at=chat.to_dict()["updated_at"]
        )
        for chat in chats
    ]

@router.get("/{chat_id}", response_model=ChatResponse)
async def get_chat(
    chat_id: str,
    db: Session = Depends(get_db),
    user_id: str = "default_user"
):
    """Get a specific chat"""
    chat_service = ChatService(db)
    chat = chat_service.get_chat(chat_id, user_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return ChatResponse(**chat.to_dict())

@router.put("/{chat_id}", response_model=ChatResponse)
async def update_chat(
    chat_id: str,
    chat_data: ChatUpdate,
    db: Session = Depends(get_db),
    user_id: str = "default_user"
):
    """Update a chat"""
    chat_service = ChatService(db)
    chat = chat_service.update_chat(chat_id, chat_data, user_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return ChatResponse(**chat.to_dict())

@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: str,
    db: Session = Depends(get_db),
    user_id: str = "default_user"
):
    """Delete a chat"""
    chat_service = ChatService(db)
    success = chat_service.delete_chat(chat_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"message": "Chat deleted successfully"}

@router.post("/{chat_id}/messages", response_model=MessageResponse)
async def add_message(
    chat_id: str,
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    user_id: str = "default_user"
):
    """Add a message to a chat"""
    chat_service = ChatService(db)
    message = chat_service.add_message_to_chat(chat_id, message_data, user_id)
    if not message:
        raise HTTPException(status_code=404, detail="Chat not found")
    return MessageResponse(**message.to_dict())

@router.get("/{chat_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    chat_id: str,
    db: Session = Depends(get_db),
    user_id: str = "default_user"
):
    """Get all messages for a chat"""
    chat_service = ChatService(db)
    messages = chat_service.get_chat_messages(chat_id, user_id)
    return [MessageResponse(**message.to_dict()) for message in messages]

@router.put("/{chat_id}/messages/{message_id}")
async def update_message(
    chat_id: str,
    message_id: str,
    content: str,
    db: Session = Depends(get_db),
    user_id: str = "default_user"
):
    """Update a message"""
    chat_service = ChatService(db)
    message = chat_service.update_message(message_id, content, chat_id, user_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return MessageResponse(**message.to_dict())

@router.get("/search", response_model=List[ChatListResponse])
async def search_chats(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    user_id: str = "default_user"
):
    """Search chats"""
    chat_service = ChatService(db)
    chats = chat_service.search_chats(q, user_id, limit)
    return [
        ChatListResponse(
            id=chat.id,
            title=chat.title,
            created_at=chat.to_dict()["created_at"],
            updated_at=chat.to_dict()["updated_at"]
        )
        for chat in chats
    ]
