from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Application
    app_name: str = "AI Cold Caller Backend"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Server
    host: str = "127.0.0.1"
    port: int = 8002
    
    # Database - PostgreSQL
    database_url: str = "postgresql://postgres:password@localhost:5432/ai_caller"
    
    # JWT Authentication
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Gemini AI Configuration
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-1.5-flash"
    
    # Twilio Configuration
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    webhook_base_url: str = "https://excited-alpaca-smart.ngrok-free.app"
    
    # Google Cloud Configuration (for speech-to-text and text-to-speech)
    google_cloud_project_id: Optional[str] = None
    google_application_credentials: Optional[str] = None
    
    # Google OAuth (for calendar integration)
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    
    # CORS
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Create settings instance
settings = Settings() 