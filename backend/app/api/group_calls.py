from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.database import get_db
from app.core.auth import get_current_active_user
from app.models.models import User, Group, GroupCall, Call, Lead
from app.schemas.schemas import GroupCall as GroupCallSchema, GroupCallCreate, GroupCallUpdate, GroupCallListResponse
from app.services.twilio_service import TwilioService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/group-calls", tags=["group-calls"])

# Initialize Twilio service
twilio_service = TwilioService()

@router.post("/", response_model=GroupCallSchema)
async def create_group_call(
    group_call_data: GroupCallCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new group call and add it to the queue"""
    try:
        # Verify the group exists and belongs to the user
        group = db.query(Group).filter(
            Group.id == group_call_data.group_id,
            Group.user_id == current_user.id
        ).first()
        
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Check if group has leads
        if not group.leads:
            raise HTTPException(status_code=400, detail="Group has no leads to call")
        
        # Create the group call
        group_call = GroupCall(
            group_id=group_call_data.group_id,
            user_id=current_user.id,
            purpose=group_call_data.purpose or "general",
            custom_prompt=group_call_data.custom_prompt,
            additional_notes=group_call_data.additional_notes,
            total_leads=len(group.leads),
            status="queued"
        )
        
        db.add(group_call)
        db.commit()
        db.refresh(group_call)
        
        logger.info(f"Group call created for group '{group.name}' by user {current_user.id}")
        return group_call
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating group call: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=GroupCallListResponse)
async def get_group_calls(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get group calls with filtering and pagination"""
    try:
        query = db.query(GroupCall).filter(GroupCall.user_id == current_user.id)
        
        if status:
            query = query.filter(GroupCall.status == status)
        
        total = query.count()
        group_calls = query.offset(skip).limit(limit).all()
        
        return GroupCallListResponse(
            group_calls=group_calls,
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
        
    except Exception as e:
        logger.error(f"Error getting group calls: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{group_call_id}", response_model=GroupCallSchema)
async def get_group_call(
    group_call_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific group call by ID"""
    try:
        group_call = db.query(GroupCall).filter(
            GroupCall.id == group_call_id,
            GroupCall.user_id == current_user.id
        ).first()
        
        if not group_call:
            raise HTTPException(status_code=404, detail="Group call not found")
        
        return group_call
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting group call {group_call_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{group_call_id}", response_model=GroupCallSchema)
async def update_group_call(
    group_call_id: int, 
    group_call_data: GroupCallUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a group call"""
    try:
        group_call = db.query(GroupCall).filter(
            GroupCall.id == group_call_id,
            GroupCall.user_id == current_user.id
        ).first()
        
        if not group_call:
            raise HTTPException(status_code=404, detail="Group call not found")
        
        # Update fields
        if group_call_data.status is not None:
            group_call.status = group_call_data.status
        if group_call_data.purpose is not None:
            group_call.purpose = group_call_data.purpose
        if group_call_data.custom_prompt is not None:
            group_call.custom_prompt = group_call_data.custom_prompt
        if group_call_data.additional_notes is not None:
            group_call.additional_notes = group_call_data.additional_notes
        
        db.commit()
        db.refresh(group_call)
        
        return group_call
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating group call {group_call_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{group_call_id}/start")
async def start_group_call(
    group_call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Start processing a group call queue"""
    try:
        group_call = db.query(GroupCall).filter(
            GroupCall.id == group_call_id,
            GroupCall.user_id == current_user.id
        ).first()
        
        if not group_call:
            raise HTTPException(status_code=404, detail="Group call not found")
        
        if group_call.status != "queued":
            raise HTTPException(status_code=400, detail="Group call is not in queued status")
        
        # Update status to in progress
        group_call.status = "in_progress"
        db.commit()
        
        # Start the first call in the queue
        await start_next_call_in_queue(group_call, db)
        
        logger.info(f"Group call {group_call_id} started by user {current_user.id}")
        return {"message": "Group call started successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting group call {group_call_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{group_call_id}/pause")
async def pause_group_call(
    group_call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Pause a group call queue"""
    try:
        group_call = db.query(GroupCall).filter(
            GroupCall.id == group_call_id,
            GroupCall.user_id == current_user.id
        ).first()
        
        if not group_call:
            raise HTTPException(status_code=404, detail="Group call not found")
        
        if group_call.status not in ["in_progress", "queued"]:
            raise HTTPException(status_code=400, detail="Group call cannot be paused in current status")
        
        group_call.status = "paused"
        db.commit()
        
        logger.info(f"Group call {group_call_id} paused by user {current_user.id}")
        return {"message": "Group call paused successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error pausing group call {group_call_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{group_call_id}/resume")
async def resume_group_call(
    group_call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Resume a paused group call queue"""
    try:
        group_call = db.query(GroupCall).filter(
            GroupCall.id == group_call_id,
            GroupCall.user_id == current_user.id
        ).first()
        
        if not group_call:
            raise HTTPException(status_code=404, detail="Group call not found")
        
        if group_call.status != "paused":
            raise HTTPException(status_code=400, detail="Group call is not paused")
        
        group_call.status = "in_progress"
        db.commit()
        
        # Start the next call in the queue
        await start_next_call_in_queue(group_call, db)
        
        logger.info(f"Group call {group_call_id} resumed by user {current_user.id}")
        return {"message": "Group call resumed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resuming group call {group_call_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{group_call_id}/next")
async def call_next_lead(
    group_call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Manually trigger the next call in the group call queue"""
    try:
        group_call = db.query(GroupCall).filter(
            GroupCall.id == group_call_id,
            GroupCall.user_id == current_user.id
        ).first()
        
        if not group_call:
            raise HTTPException(status_code=404, detail="Group call not found")
        
        if group_call.status not in ["in_progress", "paused"]:
            raise HTTPException(status_code=400, detail="Group call is not in progress or paused")
        
        # Start the next call in the queue
        result = await start_next_call_in_queue(group_call, db)
        
        if result:
            return {"message": "Next call initiated successfully"}
        else:
            return {"message": "No more leads to call in this group"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calling next lead in group call {group_call_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def start_next_call_in_queue(group_call: GroupCall, db: Session) -> bool:
    """Start the next call in the group call queue"""
    try:
        # Get the group with leads
        group = db.query(Group).filter(Group.id == group_call.group_id).first()
        if not group or not group.leads:
            return False
        
        # Check if we've completed all calls
        if group_call.current_lead_index >= len(group.leads):
            group_call.status = "completed"
            db.commit()
            return False
        
        # Get the current lead to call
        current_lead = group.leads[group_call.current_lead_index]
        
        # Create a call record
        call = Call(
            lead_id=current_lead.id,
            user_id=group_call.user_id,
            phone_number=current_lead.phone,
            status="initiated",
            purpose=group_call.purpose,
            custom_prompt=group_call.custom_prompt,
            additional_notes=group_call.additional_notes,
            group_call_id=group_call.id
        )
        
        db.add(call)
        db.commit()
        db.refresh(call)
        
        # Initiate Twilio call
        try:
            call_sid = twilio_service.initiate_call(current_lead.phone, current_lead.id)
            call.call_sid = call_sid
            db.commit()
            
            logger.info(f"Call initiated for lead {current_lead.id} in group call {group_call.id}")
            
        except Exception as e:
            logger.error(f"Failed to initiate Twilio call: {str(e)}")
            call.status = "failed"
            db.commit()
        
        return True
        
    except Exception as e:
        logger.error(f"Error starting next call in queue: {str(e)}")
        return False

@router.get("/{group_call_id}/queue-status")
async def get_queue_status(
    group_call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get the current status of the group call queue"""
    try:
        group_call = db.query(GroupCall).filter(
            GroupCall.id == group_call_id,
            GroupCall.user_id == current_user.id
        ).first()
        
        if not group_call:
            raise HTTPException(status_code=404, detail="Group call not found")
        
        # Get group details
        group = db.query(Group).filter(Group.id == group_call.group_id).first()
        
        # Get call statistics
        total_calls = db.query(Call).filter(Call.group_call_id == group_call_id).count()
        completed_calls = db.query(Call).filter(
            Call.group_call_id == group_call_id,
            Call.status.in_(["completed", "failed"])
        ).count()
        
        return {
            "group_call_id": group_call.id,
            "group_name": group.name if group else "Unknown",
            "status": group_call.status,
            "current_lead_index": group_call.current_lead_index,
            "total_leads": group_call.total_leads,
            "total_calls": total_calls,
            "completed_calls": completed_calls,
            "remaining_calls": group_call.total_leads - group_call.current_lead_index,
            "progress_percentage": (group_call.current_lead_index / group_call.total_leads * 100) if group_call.total_leads > 0 else 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting queue status for group call {group_call_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

