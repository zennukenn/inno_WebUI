from sqlalchemy import Column, String, Text, DateTime, JSON, Integer, Boolean
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Chat(Base):
    __tablename__ = "chats"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False, default="New Chat")
    user_id = Column(String, nullable=False, default="default_user")
    
    # Chat metadata
    model = Column(String, nullable=True)
    system_prompt = Column(Text, nullable=True)
    temperature = Column(Integer, default=0.7)
    max_tokens = Column(Integer, default=2048)
    
    # Chat history stored as JSON
    messages = Column(JSON, default=list)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Status
    archived = Column(Boolean, default=False)
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "user_id": self.user_id,
            "model": self.model,
            "system_prompt": self.system_prompt,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "messages": self.messages or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "archived": self.archived
        }

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chat_id = Column(String, nullable=False)
    parent_id = Column(String, nullable=True)
    
    # Message content
    role = Column(String, nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    
    # Message metadata
    model = Column(String, nullable=True)
    timestamp = Column(Integer, nullable=False)
    
    # Additional data
    meta_data = Column(JSON, default=dict)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "chat_id": self.chat_id,
            "parent_id": self.parent_id,
            "role": self.role,
            "content": self.content,
            "model": self.model,
            "timestamp": self.timestamp,
            "metadata": self.meta_data or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
