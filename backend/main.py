import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import socketio
import logging

from app.config import settings
from app.database import init_db
from app.utils.db_init import initialize_database
from app.api.chats import router as chats_router
from app.api.chat_completion import router as chat_completion_router
from app.api.models import router as models_router

# Configure logging
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="VLLM Chat API",
    description="Chat API for VLLM inference",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
try:
    initialize_database()
except Exception as e:
    logger.error(f"Database initialization failed: {e}")
    raise

# Include routers
app.include_router(chats_router, prefix="/api")
app.include_router(chat_completion_router, prefix="/api")
app.include_router(models_router, prefix="/api")

# Create Socket.IO server
if settings.ENABLE_WEBSOCKET:
    sio = socketio.AsyncServer(
        cors_allowed_origins=settings.CORS_ORIGINS,
        async_mode="asgi"
    )
    
    # Socket.IO event handlers
    @sio.event
    async def connect(sid, environ):
        logger.info(f"Client {sid} connected")
        await sio.emit("connected", {"message": "Connected to VLLM Chat"}, room=sid)

    @sio.event
    async def disconnect(sid):
        logger.info(f"Client {sid} disconnected")

    @sio.event
    async def join_chat(sid, data):
        """Join a chat room"""
        chat_id = data.get("chat_id")
        if chat_id:
            await sio.enter_room(sid, f"chat_{chat_id}")
            logger.info(f"Client {sid} joined chat {chat_id}")

    @sio.event
    async def leave_chat(sid, data):
        """Leave a chat room"""
        chat_id = data.get("chat_id")
        if chat_id:
            await sio.leave_room(sid, f"chat_{chat_id}")
            logger.info(f"Client {sid} left chat {chat_id}")

    # Combine FastAPI and Socket.IO
    socket_app = socketio.ASGIApp(sio, app)
else:
    socket_app = app

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "VLLM Chat API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import os
    # 在Docker环境中禁用reload
    reload_enabled = os.getenv("ENABLE_RELOAD", "false").lower() == "true"

    uvicorn.run(
        "main:socket_app" if settings.ENABLE_WEBSOCKET else "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=reload_enabled,
        log_level=settings.LOG_LEVEL.lower()
    )
