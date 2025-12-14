from typing import List
import os

class Settings:
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000")
    CORS_ORIGINS: List[str] = [origin.strip() for origin in cors_origins_str.split(",")]
    
    MODEL_PATH: str = os.getenv("MODEL_PATH", "models/best.pt")
    MODEL_CONF_THRESHOLD: float = float(os.getenv("MODEL_CONF_THRESHOLD", "0.25"))
    MODEL_IOU_THRESHOLD: float = float(os.getenv("MODEL_IOU_THRESHOLD", "0.45"))
    
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", str(50 * 1024 * 1024)))

settings = Settings()

