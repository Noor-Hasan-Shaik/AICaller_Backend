from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import Call, Lead
from app.services.twilio_service import TwilioService
from app.services.ai_service import AIService
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhook", tags=["webhooks"])

# Initialize services
twilio_service = TwilioService()
ai_service = AIService()

@router.post("/")
async def start_call():
    """Return TwiML template for call handling (same as simple_caller)"""
    try:
        from fastapi.responses import HTMLResponse
        return HTMLResponse(content=open("templates/streams.xml").read(), media_type="application/xml")
    except Exception as e:
        logger.error(f"Error returning TwiML template: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to return TwiML template")

@router.post("/call-start")
async def call_start_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Twilio call start webhook"""
    try:
        form_data = await request.form()
        call_sid = form_data.get("CallSid")
        lead_id = request.query_params.get("lead_id")
        
        logger.info(f"Call start webhook received - SID: {call_sid}, Lead ID: {lead_id}")
        
        if lead_id:
            # Update call status in database
            call = db.query(Call).filter(Call.call_sid == call_sid).first()
            if call:
                call.status = "ringing"
                call.updated_at = datetime.utcnow()
                db.commit()
                logger.info(f"Updated call {call_sid} status to ringing")
        
        # Return simple TwiML template (lead info will be fetched via callSid in WebSocket)
        from fastapi.responses import HTMLResponse
        
        twiml_content = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="wss://excited-alpaca-smart.ngrok-free.app/api/ws" />
    </Connect>
    <!-- Keep the call active -->
    <Pause length="3600"/>
</Response>"""
        
        return HTMLResponse(content=twiml_content, media_type="application/xml")
        
    except Exception as e:
        logger.error(f"Error in call start webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

@router.post("/call-status")
async def call_status_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Twilio call status webhook"""
    try:
        form_data = await request.form()
        call_sid = form_data.get("CallSid")
        call_status = form_data.get("CallStatus")
        call_duration = form_data.get("CallDuration")
        
        logger.info(f"Call status webhook - SID: {call_sid}, Status: {call_status}, Duration: {call_duration}")
        
        # Update call status in database
        call = db.query(Call).filter(Call.call_sid == call_sid).first()
        if call:
            call.status = call_status
            if call_duration:
                call.duration = int(call_duration)
            call.updated_at = datetime.utcnow()
            
            # Set outcome based on status
            if call_status == "completed":
                call.outcome = "completed"
            elif call_status == "failed":
                call.outcome = "failed"
            elif call_status == "busy":
                call.outcome = "busy"
            elif call_status == "no-answer":
                call.outcome = "no-answer"
            
            db.commit()
            logger.info(f"Updated call {call_sid} status to {call_status}")
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Error in call status webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Webhook processing failed") 