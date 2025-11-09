from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.schemas import HealthResponse, ConversationRequest
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/health", tags=["health"])

@router.get("/", response_model=HealthResponse)
async def health_check():
    """Basic health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="AI Cold Caller Backend is running",
        timestamp=datetime.utcnow()
    )

@router.get("/database")
async def database_health_check(db: Session = Depends(get_db)):
    """Check database connectivity"""
    try:
        # Simple query to test database connection
        result = db.execute("SELECT 1").scalar()
        if result == 1:
            return {
                "status": "healthy",
                "database": "connected",
                "timestamp": datetime.utcnow()
            }
        else:
            return {
                "status": "unhealthy",
                "database": "connection_failed",
                "timestamp": datetime.utcnow()
            }
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "database": "connection_error",
            "error": str(e),
            "timestamp": datetime.utcnow()
        }

@router.get("/ai")
async def ai_health_check():
    """Check AI service health"""
    try:
        # Import AI service for health check
        from app.services.ai_service import AIService
        ai_service = AIService()
        
        # Simple test to verify Gemini API is working
        test_response = await ai_service.generate_response(
            ConversationRequest(lead_id=1, message="Hello")
        )
        
        if test_response.status == "success":
            return {
                "status": "healthy",
                "ai_service": "gemini",
                "model": "gemini-1.5-flash",
                "timestamp": datetime.utcnow()
            }
        else:
            return {
                "status": "unhealthy",
                "ai_service": "gemini",
                "error": "AI response generation failed",
                "timestamp": datetime.utcnow()
            }
            
    except Exception as e:
        logger.error(f"AI health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "ai_service": "gemini",
            "error": str(e),
            "timestamp": datetime.utcnow()
        }

@router.get("/full")
async def full_health_check(db: Session = Depends(get_db)):
    """Comprehensive health check for all services"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {}
    }
    
    # Check database
    try:
        result = db.execute("SELECT 1").scalar()
        health_status["services"]["database"] = {
            "status": "healthy" if result == 1 else "unhealthy"
        }
    except Exception as e:
        health_status["services"]["database"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "unhealthy"
    
    # Check AI service
    try:
        from app.services.ai_service import AIService
        ai_service = AIService()
        test_response = await ai_service.generate_response(
            ConversationRequest(lead_id=1, message="Hello")
        )
        health_status["services"]["ai"] = {
            "status": "healthy" if test_response.status == "success" else "unhealthy",
            "service": "gemini",
            "model": "gemini-1.5-flash"
        }
        if test_response.status != "success":
            health_status["status"] = "unhealthy"
    except Exception as e:
        health_status["services"]["ai"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "unhealthy"
    
    return health_status 