from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.database import get_db
from app.core.auth import get_current_active_user
from app.models.models import User, Group, Lead, lead_groups
from app.schemas.schemas import Group as GroupSchema, GroupCreate, GroupUpdate, GroupListResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/groups", tags=["groups"])

@router.post("/", response_model=GroupSchema)
async def create_group(
    group_data: GroupCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new group"""
    try:
        # Create the group
        group = Group(
            name=group_data.name,
            description=group_data.description,
            user_id=current_user.id
        )
        db.add(group)
        db.commit()
        db.refresh(group)
        
        # Add leads to the group if specified
        if group_data.lead_ids:
            # Verify all leads belong to the current user
            leads = db.query(Lead).filter(
                Lead.id.in_(group_data.lead_ids),
                Lead.user_id == current_user.id
            ).all()
            
            if len(leads) != len(group_data.lead_ids):
                raise HTTPException(status_code=400, detail="Some leads not found or don't belong to you")
            
            # Add leads to group
            for lead in leads:
                group.leads.append(lead)
            
            db.commit()
            db.refresh(group)
        
        logger.info(f"Group '{group.name}' created by user {current_user.id}")
        return group
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating group: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=GroupListResponse)
async def get_groups(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get groups with filtering and pagination"""
    try:
        query = db.query(Group).filter(Group.user_id == current_user.id)
        
        if search:
            query = query.filter(Group.name.ilike(f"%{search}%"))
        
        total = query.count()
        groups = query.offset(skip).limit(limit).all()
        
        return GroupListResponse(
            groups=groups,
            total=total,
            page=skip // limit + 1,
            per_page=limit
        )
        
    except Exception as e:
        logger.error(f"Error getting groups: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{group_id}", response_model=GroupSchema)
async def get_group(
    group_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific group by ID"""
    try:
        group = db.query(Group).filter(
            Group.id == group_id,
            Group.user_id == current_user.id
        ).first()
        
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        return group
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting group {group_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{group_id}", response_model=GroupSchema)
async def update_group(
    group_id: int, 
    group_data: GroupUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a group"""
    try:
        group = db.query(Group).filter(
            Group.id == group_id,
            Group.user_id == current_user.id
        ).first()
        
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Update basic fields
        if group_data.name is not None:
            group.name = group_data.name
        if group_data.description is not None:
            group.description = group_data.description
        
        # Update leads if specified
        if group_data.lead_ids is not None:
            # Clear existing leads
            group.leads.clear()
            
            if group_data.lead_ids:
                # Verify all leads belong to the current user
                leads = db.query(Lead).filter(
                    Lead.id.in_(group_data.lead_ids),
                    Lead.user_id == current_user.id
                ).all()
                
                if len(leads) != len(group_data.lead_ids):
                    raise HTTPException(status_code=400, detail="Some leads not found or don't belong to you")
                
                # Add new leads to group
                for lead in leads:
                    group.leads.append(lead)
        
        db.commit()
        db.refresh(group)
        
        logger.info(f"Group '{group.name}' updated by user {current_user.id}")
        return group
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating group {group_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{group_id}")
async def delete_group(
    group_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a group"""
    try:
        group = db.query(Group).filter(
            Group.id == group_id,
            Group.user_id == current_user.id
        ).first()
        
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Remove all lead associations
        group.leads.clear()
        
        # Delete the group
        db.delete(group)
        db.commit()
        
        logger.info(f"Group '{group.name}' deleted by user {current_user.id}")
        return {"message": "Group deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting group {group_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{group_id}/leads/{lead_id}")
async def add_lead_to_group(
    group_id: int,
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a lead to a group"""
    try:
        # Verify group exists and belongs to user
        group = db.query(Group).filter(
            Group.id == group_id,
            Group.user_id == current_user.id
        ).first()
        
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Verify lead exists and belongs to user
        lead = db.query(Lead).filter(
            Lead.id == lead_id,
            Lead.user_id == current_user.id
        ).first()
        
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # Check if lead is already in group
        if lead in group.leads:
            raise HTTPException(status_code=400, detail="Lead is already in this group")
        
        # Add lead to group
        group.leads.append(lead)
        db.commit()
        
        logger.info(f"Lead {lead_id} added to group '{group.name}' by user {current_user.id}")
        return {"message": "Lead added to group successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding lead {lead_id} to group {group_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{group_id}/leads/{lead_id}")
async def remove_lead_from_group(
    group_id: int,
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove a lead from a group"""
    try:
        # Verify group exists and belongs to user
        group = db.query(Group).filter(
            Group.id == group_id,
            Group.user_id == current_user.id
        ).first()
        
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Verify lead exists and belongs to user
        lead = db.query(Lead).filter(
            Lead.id == lead_id,
            Lead.user_id == current_user.id
        ).first()
        
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # Check if lead is in group
        if lead not in group.leads:
            raise HTTPException(status_code=400, detail="Lead is not in this group")
        
        # Remove lead from group
        group.leads.remove(lead)
        db.commit()
        
        logger.info(f"Lead {lead_id} removed from group '{group.name}' by user {current_user.id}")
        return {"message": "Lead removed from group successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing lead {lead_id} from group {group_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{group_id}/leads")
async def get_group_leads(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all leads in a group"""
    try:
        group = db.query(Group).filter(
            Group.id == group_id,
            Group.user_id == current_user.id
        ).first()
        
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        return {"leads": group.leads}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting leads for group {group_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

