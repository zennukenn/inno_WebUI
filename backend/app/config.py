import os
from typing import Optional

class Settings:
    # VLLM API Configuration
    VLLM_API_BASE_URL: str = os.getenv("VLLM_API_BASE_URL", "http://localhost:8000/v1")
    VLLM_API_KEY: Optional[str] = os.getenv("VLLM_API_KEY")

    # Allow dynamic VLLM URL updates
    ALLOW_DYNAMIC_VLLM_URL: bool = os.getenv("ALLOW_DYNAMIC_VLLM_URL", "true").lower() == "true"
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "")
    
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./chat.db")
    
    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8080"))
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    # WebSocket
    ENABLE_WEBSOCKET: bool = True
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()
