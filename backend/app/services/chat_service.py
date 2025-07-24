from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
import time
import uuid

from app.models.chat import Chat, Message
from app.schemas.chat import ChatCreate, ChatUpdate, MessageCreate
from app.database import get_db

class ChatService:
    def __init__(self, db: Session):
        self.db = db

    def create_chat(self, chat_data: ChatCreate, user_id: str = "default_user") -> Chat:
        """Create a new chat"""
        chat = Chat(
            id=str(uuid.uuid4()),
            title=chat_data.title or "New Chat",
            user_id=user_id,
            model=chat_data.model,
            system_prompt=chat_data.system_prompt,
            temperature=chat_data.temperature,
            max_tokens=chat_data.max_tokens,
            messages=[]
        )
        
        self.db.add(chat)
        self.db.commit()
        self.db.refresh(chat)
        return chat

    def get_chat(self, chat_id: str, user_id: str = "default_user") -> Optional[Chat]:
        """Get a chat by ID"""
        return self.db.query(Chat).filter(
            Chat.id == chat_id,
            Chat.user_id == user_id,
            Chat.archived == False
        ).first()

    def get_chats(self, user_id: str = "default_user", limit: int = 50, offset: int = 0) -> List[Chat]:
        """Get all chats for a user"""
        return self.db.query(Chat).filter(
            Chat.user_id == user_id,
            Chat.archived == False
        ).order_by(desc(Chat.updated_at)).offset(offset).limit(limit).all()

    def update_chat(self, chat_id: str, chat_data: ChatUpdate, user_id: str = "default_user") -> Optional[Chat]:
        """Update a chat"""
        chat = self.get_chat(chat_id, user_id)
        if not chat:
            return None

        update_data = chat_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(chat, field, value)

        self.db.commit()
        self.db.refresh(chat)
        return chat

    def delete_chat(self, chat_id: str, user_id: str = "default_user") -> bool:
        """Delete a chat (mark as archived)"""
        chat = self.get_chat(chat_id, user_id)
        if not chat:
            return False

        chat.archived = True
        self.db.commit()
        return True

    def add_message_to_chat(self, chat_id: str, message_data: MessageCreate, user_id: str = "default_user") -> Optional[Message]:
        """Add a message to a chat"""
        chat = self.get_chat(chat_id, user_id)
        if not chat:
            return None

        # Create message
        message = Message(
            id=str(uuid.uuid4()),
            chat_id=chat_id,
            parent_id=message_data.parent_id,
            role=message_data.role,
            content=message_data.content,
            timestamp=message_data.timestamp or int(time.time())
        )

        self.db.add(message)

        # Update chat messages - ensure it's a proper list
        chat_messages = list(chat.messages) if chat.messages else []
        chat_messages.append(message.to_dict())
        chat.messages = chat_messages

        # Update chat timestamp
        chat.updated_at = message.created_at

        self.db.commit()
        self.db.refresh(message)
        return message

    def get_chat_messages(self, chat_id: str, user_id: str = "default_user") -> List[Message]:
        """Get all messages for a chat"""
        chat = self.get_chat(chat_id, user_id)
        if not chat:
            return []

        return self.db.query(Message).filter(
            Message.chat_id == chat_id
        ).order_by(Message.timestamp).all()

    def update_message(self, message_id: str, content: str, chat_id: str, user_id: str = "default_user") -> Optional[Message]:
        """Update a message"""
        # Verify chat ownership
        chat = self.get_chat(chat_id, user_id)
        if not chat:
            return None

        message = self.db.query(Message).filter(
            Message.id == message_id,
            Message.chat_id == chat_id
        ).first()

        if not message:
            return None

        message.content = content

        # Update in chat messages as well
        chat_messages = list(chat.messages) if chat.messages else []
        for i, msg in enumerate(chat_messages):
            if msg.get('id') == message_id:
                chat_messages[i]['content'] = content
                chat_messages[i]['updated_at'] = message.updated_at.isoformat() if message.updated_at else None
                break

        chat.messages = chat_messages

        self.db.commit()
        self.db.refresh(message)
        return message

    def search_chats(self, query: str, user_id: str = "default_user", limit: int = 20) -> List[Chat]:
        """Search chats by title or content"""
        return self.db.query(Chat).filter(
            Chat.user_id == user_id,
            Chat.archived == False,
            Chat.title.contains(query)
        ).order_by(desc(Chat.updated_at)).limit(limit).all()

def get_chat_service(db: Session = None) -> ChatService:
    """Get chat service instance"""
    if db is None:
        db = next(get_db())
    return ChatService(db)
