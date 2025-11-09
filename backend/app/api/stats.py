from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import Optional
from app.database.database import get_db
from app.models.models import Lead, Call, SystemStatus, Group, GroupCall
from app.schemas.schemas import DashboardStats, CallStats, LeadStats, GroupStats, QueueStats
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/stats", tags=["statistics"])

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db)):
    """Get dashboard statistics for the specified number of days"""
    try:
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Call statistics
        call_stats = get_call_statistics(db, start_date, end_date)
        
        # Lead statistics
        lead_stats = get_lead_statistics(db, start_date, end_date)
        
        # Queue statistics
        queue_stats = get_queue_statistics(db)
        
        # Group statistics
        group_stats = get_group_statistics(db)
        
        return DashboardStats(
            call_stats=call_stats,
            lead_stats=lead_stats,
            group_stats=group_stats,
            queue_stats=queue_stats
        )
        
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/calls", response_model=CallStats)
async def get_call_stats(days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db)):
    """Get call statistics"""
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        stats = get_call_statistics(db, start_date, end_date)
        return stats
        
    except Exception as e:
        logger.error(f"Error getting call stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/leads", response_model=LeadStats)
async def get_lead_stats(days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db)):
    """Get lead statistics"""
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        stats = get_lead_statistics(db, start_date, end_date)
        return stats
        
    except Exception as e:
        logger.error(f"Error getting lead stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/queue", response_model=QueueStats)
async def get_queue_stats(db: Session = Depends(get_db)):
    """Get queue statistics"""
    try:
        stats = get_queue_statistics(db)
        return stats
        
    except Exception as e:
        logger.error(f"Error getting queue stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

def get_call_statistics(db: Session, start_date: datetime, end_date: datetime) -> CallStats:
    """Calculate call statistics for the given date range"""
    try:
        # Total calls in date range
        total_calls = db.query(Call).filter(
            and_(Call.created_at >= start_date, Call.created_at <= end_date)
        ).count()
        
        # Answered calls
        answered_calls = db.query(Call).filter(
            and_(
                Call.created_at >= start_date,
                Call.created_at <= end_date,
                Call.outcome == "completed"
            )
        ).count()
        
        # Meetings scheduled
        meetings_scheduled = db.query(Call).filter(
            and_(
                Call.created_at >= start_date,
                Call.created_at <= end_date,
                Call.outcome == "meeting_scheduled"
            )
        ).count()
        
        # No answer calls
        no_answer_calls = db.query(Call).filter(
            and_(
                Call.created_at >= start_date,
                Call.created_at <= end_date,
                Call.status == "no-answer"
            )
        ).count()
        
        # Rejected calls
        rejected_calls = db.query(Call).filter(
            and_(
                Call.created_at >= start_date,
                Call.created_at <= end_date,
                Call.outcome == "rejected"
            )
        ).count()
        
        # Average call duration
        avg_duration_result = db.query(func.avg(Call.duration)).filter(
            and_(Call.created_at >= start_date, Call.created_at <= end_date)
        ).scalar()
        avg_call_duration = float(avg_duration_result) if avg_duration_result else 0.0
        
        # Calculate rates
        answer_rate = (answered_calls / total_calls * 100) if total_calls > 0 else 0.0
        meeting_rate = (meetings_scheduled / total_calls * 100) if total_calls > 0 else 0.0
        
        return CallStats(
            total_calls=total_calls,
            answered_calls=answered_calls,
            meetings_scheduled=meetings_scheduled,
            no_answer_calls=no_answer_calls,
            rejected_calls=rejected_calls,
            avg_call_duration=avg_call_duration,
            answer_rate=answer_rate,
            meeting_rate=meeting_rate
        )
        
    except Exception as e:
        logger.error(f"Error calculating call statistics: {str(e)}")
        return CallStats(
            total_calls=0,
            answered_calls=0,
            meetings_scheduled=0,
            no_answer_calls=0,
            rejected_calls=0,
            avg_call_duration=0.0,
            answer_rate=0.0,
            meeting_rate=0.0
        )

def get_lead_statistics(db: Session, start_date: datetime, end_date: datetime) -> LeadStats:
    """Calculate lead statistics for the given date range"""
    try:
        # Total leads in date range
        total_leads = db.query(Lead).filter(
            and_(Lead.created_at >= start_date, Lead.created_at <= end_date)
        ).count()
        
        # Status breakdown
        pending_leads = db.query(Lead).filter(
            and_(
                Lead.created_at >= start_date,
                Lead.created_at <= end_date,
                Lead.status == "pending"
            )
        ).count()
        
        scheduled_leads = db.query(Lead).filter(
            and_(
                Lead.created_at >= start_date,
                Lead.created_at <= end_date,
                Lead.status == "scheduled"
            )
        ).count()
        
        called_leads = db.query(Lead).filter(
            and_(
                Lead.created_at >= start_date,
                Lead.created_at <= end_date,
                Lead.status == "called"
            )
        ).count()
        
        not_interested_leads = db.query(Lead).filter(
            and_(
                Lead.created_at >= start_date,
                Lead.created_at <= end_date,
                Lead.status == "not_interested"
            )
        ).count()
        
        # Calculate conversion rate
        conversion_rate = ((scheduled_leads + called_leads) / total_leads * 100) if total_leads > 0 else 0.0
        
        return LeadStats(
            total_leads=total_leads,
            pending_leads=pending_leads,
            scheduled_leads=scheduled_leads,
            called_leads=called_leads,
            not_interested_leads=not_interested_leads,
            conversion_rate=conversion_rate
        )
        
    except Exception as e:
        logger.error(f"Error calculating lead statistics: {str(e)}")
        return LeadStats(
            total_leads=0,
            pending_leads=0,
            scheduled_leads=0,
            called_leads=0,
            not_interested_leads=0,
            conversion_rate=0.0
        )

def get_queue_statistics(db: Session) -> QueueStats:
    """Calculate queue statistics"""
    try:
        # Active calls
        active_calls = db.query(Call).filter(Call.status == "answered").count()
        
        # Queued calls (initiated but not answered)
        queued_calls = db.query(Call).filter(Call.status == "initiated").count()
        
        # Completed calls
        completed_calls = db.query(Call).filter(Call.status == "completed").count()
        
        # Failed calls
        failed_calls = db.query(Call).filter(Call.status == "failed").count()
        
        return QueueStats(
            queued_calls=queued_calls,
            active_calls=active_calls,
            completed_calls=completed_calls,
            failed_calls=failed_calls
        )
        
    except Exception as e:
        logger.error(f"Error calculating queue statistics: {str(e)}")
        return QueueStats(
            queued_calls=0,
            active_calls=0,
            completed_calls=0,
            failed_calls=0
        )

def get_group_statistics(db: Session) -> GroupStats:
    """Calculate group statistics"""
    try:
        # Total groups
        total_groups = db.query(Group).count()
        
        # Total leads in groups (using the association table)
        # Count all leads that are in any group
        total_leads_in_groups = db.query(func.count(Lead.id)).join(
            Lead.groups
        ).scalar() or 0
        
        # Active group calls (not completed)
        active_group_calls = db.query(GroupCall).filter(
            GroupCall.status != "completed"
        ).count()
        
        # Completed group calls
        completed_group_calls = db.query(GroupCall).filter(
            GroupCall.status == "completed"
        ).count()
        
        return GroupStats(
            total_groups=total_groups,
            total_leads_in_groups=total_leads_in_groups,
            active_group_calls=active_group_calls,
            completed_group_calls=completed_group_calls
        )
        
    except Exception as e:
        logger.error(f"Error calculating group statistics: {str(e)}")
        return GroupStats(
            total_groups=0,
            total_leads_in_groups=0,
            active_group_calls=0,
            completed_group_calls=0
        ) 