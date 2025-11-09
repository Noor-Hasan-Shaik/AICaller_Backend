from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.database import get_db
from app.core.auth import get_current_active_user
from app.models.models import User, Call, Lead
from app.schemas.schemas import Call as CallSchema, CallCreate
from app.services.twilio_service import TwilioService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/calls", tags=["calls"])

# Initialize Twilio service
twilio_service = TwilioService()

@router.post("/", response_model=CallSchema)
async def start_call(
    call_data: CallCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Start a call for a lead"""
    try:
        # Verify the lead exists and belongs to the user
        lead = db.query(Lead).filter(
            Lead.id == call_data.lead_id,
            Lead.user_id == current_user.id
        ).first()
        
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # Use phone_number from request or fall back to lead's phone
        phone_number = call_data.phone_number or lead.phone
        
        # Validate phone number
        if not twilio_service.validate_phone_number(phone_number):
            raise HTTPException(status_code=400, detail="Invalid phone number format")
        
        # Initiate Twilio call
        try:
            call_sid = twilio_service.initiate_call(phone_number, call_data.lead_id)
            logger.info(f"Twilio call initiated with SID: {call_sid}")
        except Exception as e:
            logger.error(f"Failed to initiate Twilio call: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to initiate call: {str(e)}")
        
        # Create a new call record in database
        call = Call(
            lead_id=call_data.lead_id,
            user_id=current_user.id,
            phone_number=phone_number,
            status="initiated",
            call_sid=call_sid,
            purpose=call_data.purpose or "general",
            custom_prompt=call_data.custom_prompt,
            additional_notes=call_data.additional_notes
        )
        
        db.add(call)
        db.commit()
        db.refresh(call)
        
        logger.info(f"Call started for lead {call_data.lead_id} by user {current_user.id}, SID: {call_sid}, Purpose: {call_data.purpose}")
        
        return call
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting call: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start call")

@router.get("/", response_model=List[CallSchema])
async def get_calls(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all calls for the current user"""
    try:
        calls = db.query(Call).filter(
            Call.user_id == current_user.id
        ).offset(skip).limit(limit).all()
        
        return calls
        
    except Exception as e:
        logger.error(f"Error getting calls: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve calls")

@router.get("/{call_id}", response_model=CallSchema)
async def get_call(
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific call by ID"""
    try:
        call = db.query(Call).filter(
            Call.id == call_id,
            Call.user_id == current_user.id
        ).first()
        
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")
        
        return call
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting call {call_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve call")

@router.put("/{call_id}", response_model=CallSchema)
async def update_call(
    call_id: int,
    call_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a call status"""
    try:
        call = db.query(Call).filter(
            Call.id == call_id,
            Call.user_id == current_user.id
        ).first()
        
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")
        
        # Update call fields
        for field, value in call_data.items():
            if hasattr(call, field):
                setattr(call, field, value)
        
        db.commit()
        db.refresh(call)
        
        return call
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating call {call_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update call") 