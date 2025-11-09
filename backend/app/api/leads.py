from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.database import get_db
from app.core.auth import get_current_active_user
from app.models.models import User
from app.services.lead_service import LeadService
from app.schemas.schemas import Lead, LeadCreate, LeadUpdate, LeadListResponse, FileUploadResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/leads", tags=["leads"])

@router.post("/", response_model=Lead)
async def create_lead(
    lead_data: LeadCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new lead"""
    try:
        lead_service = LeadService(db)
        lead = lead_service.create_lead(lead_data, current_user.id)
        return lead
    except Exception as e:
        logger.error(f"Error creating lead: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=LeadListResponse)
async def get_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get leads with filtering and pagination"""
    try:
        lead_service = LeadService(db)
        result = lead_service.get_leads(
            current_user.id,
            skip=skip,
            limit=limit,
            search=search,
            status=status,
            priority=priority
        )
        return LeadListResponse(**result)
    except Exception as e:
        logger.error(f"Error getting leads: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{lead_id}", response_model=Lead)
async def get_lead(
    lead_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific lead by ID"""
    try:
        lead_service = LeadService(db)
        lead = lead_service.get_lead(lead_id, current_user.id)
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        return lead
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting lead {lead_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{lead_id}", response_model=Lead)
async def update_lead(
    lead_id: int, 
    lead_data: LeadUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a lead"""
    try:
        lead_service = LeadService(db)
        lead = lead_service.update_lead(lead_id, lead_data, current_user.id)
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        return lead
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating lead {lead_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{lead_id}")
async def delete_lead(
    lead_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a lead"""
    try:
        lead_service = LeadService(db)
        success = lead_service.delete_lead(lead_id, current_user.id)
        if not success:
            raise HTTPException(status_code=404, detail="Lead not found")
        return {"message": "Lead deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting lead {lead_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/upload", response_model=FileUploadResponse)
async def upload_leads_csv(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Upload leads from CSV file"""
    try:
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        # Read file content
        content = await file.read()
        
        lead_service = LeadService(db)
        result = lead_service.import_leads_from_csv(content, current_user.id)
        
        return FileUploadResponse(
            filename=file.filename,
            imported_count=result["imported_count"],
            errors=result["errors"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading leads CSV: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/statistics")
async def get_lead_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get lead statistics"""
    try:
        lead_service = LeadService(db)
        stats = lead_service.get_lead_statistics(current_user.id)
        return stats
    except Exception as e:
        logger.error(f"Error getting lead statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error") 