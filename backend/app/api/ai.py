from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.database import get_db
from app.services.ai_service import AIService
from app.services.lead_service import LeadService
from app.schemas.schemas import ConversationRequest, ConversationResponse
import logging
from starlette.responses import HTMLResponse


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai"])

# Initialize AI service
ai_service = AIService()

@router.post("/")
async def start_call():
    logger.info("CALl STARTED")   
    return HTMLResponse(content=open("templates/streams.xml").read(), media_type="application/xml")


@router.post("/conversation", response_model=ConversationResponse)
async def start_conversation(request: ConversationRequest, db: Session = Depends(get_db)):
    """Start or continue a conversation with AI using existing GeminiMultimodalLiveLLMService"""
    try:
        # Get lead information
        lead_service = LeadService(db)
        lead = lead_service.get_lead(request.lead_id)
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # Generate AI response using existing service
        response = await ai_service.generate_response(request)
        
        return ConversationResponse(
            response=response["response"],
            status=response["status"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in AI conversation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/analyze-conversation")
async def analyze_conversation(conversation: List[Dict[str, str]], db: Session = Depends(get_db)):
    """Analyze conversation sentiment and extract insights using existing service"""
    try:
        analysis = await ai_service.analyze_conversation_sentiment(conversation)
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing conversation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/generate-follow-up")
async def generate_follow_up(lead_id: int, conversation_summary: str, db: Session = Depends(get_db)):
    """Generate follow-up message based on conversation using existing service"""
    try:
        # Get lead information
        lead_service = LeadService(db)
        lead = lead_service.get_lead(lead_id)
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        lead_info = {
            "name": lead.name,
            "company": lead.company,
            "phone": lead.phone,
            "email": lead.email
        }
        
        # Generate follow-up message using existing service
        follow_up = await ai_service.generate_follow_up_message(lead_info, conversation_summary)
        
        return {"follow_up_message": follow_up}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating follow-up: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/health")
async def ai_health_check():
    """Check AI service health"""
    try:
        # Test the existing GeminiMultimodalLiveLLMService
        test_request = type('obj', (object,), {
            'lead_id': 1,
            'message': 'Hello'
        })
        
        test_response = await ai_service.generate_response(test_request)
        
        return {
            "status": "healthy",
            "ai_service": "GeminiMultimodalLiveLLMService",
            "voice_id": "Aoede",
            "transcribe_user_audio": True,
            "transcribe_model_audio": True
        }
        
    except Exception as e:
        logger.error(f"AI health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        } 