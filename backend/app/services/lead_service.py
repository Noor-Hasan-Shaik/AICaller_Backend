from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from app.models.models import Lead
from app.schemas.schemas import LeadCreate, LeadUpdate
import pandas as pd
import io
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class LeadService:
    def __init__(self, db: Session):
        self.db = db

    def create_lead(self, lead_data: LeadCreate, user_id: int) -> Lead:
        """Create a new lead for the specified user"""
        # Check if phone number already exists for this user
        existing_lead = self.db.query(Lead).filter(
            and_(Lead.phone == lead_data.phone, Lead.user_id == user_id)
        ).first()
        
        if existing_lead:
            raise ValueError(f"Phone number {lead_data.phone} already exists for this user")
        
        db_lead = Lead(**lead_data.dict(), user_id=user_id)
        self.db.add(db_lead)
        self.db.commit()
        self.db.refresh(db_lead)
        return db_lead

    def get_leads(self, user_id: int, skip: int = 0, limit: int = 100, 
                  search: Optional[str] = None, status: Optional[str] = None, 
                  priority: Optional[int] = None) -> Dict:
        """Get leads for the specified user with filtering"""
        query = self.db.query(Lead).filter(Lead.user_id == user_id)
        
        if search:
            search_filter = or_(
                Lead.name.ilike(f"%{search}%"),
                Lead.company.ilike(f"%{search}%"),
                Lead.email.ilike(f"%{search}%"),
                Lead.phone.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        if status:
            query = query.filter(Lead.status == status)
        
        if priority:
            query = query.filter(Lead.priority == priority)
        
        total = query.count()
        leads = query.offset(skip).limit(limit).all()
        
        return {
            "leads": leads,
            "total": total,
            "page": skip // limit + 1,
            "per_page": limit
        }

    def get_lead(self, lead_id: int, user_id: int) -> Optional[Lead]:
        """Get a specific lead by ID for the specified user"""
        return self.db.query(Lead).filter(
            and_(Lead.id == lead_id, Lead.user_id == user_id)
        ).first()

    def get_lead_details(self, lead_id: int) -> Optional[Lead]:
        """Get a specific lead by ID"""
        return self.db.query(Lead).filter(Lead.id == lead_id).first()

    def update_lead(self, lead_id: int, lead_data: LeadUpdate, user_id: int) -> Optional[Lead]:
        """Update a lead for the specified user"""
        lead = self.get_lead(lead_id, user_id)
        if not lead:
            return None
        
        update_data = lead_data.dict(exclude_unset=True)
        
        # If phone number is being updated, check for uniqueness per user
        if 'phone' in update_data and update_data['phone'] != lead.phone:
            existing_lead = self.db.query(Lead).filter(
                and_(
                    Lead.phone == update_data['phone'], 
                    Lead.user_id == user_id,
                    Lead.id != lead_id  # Exclude current lead from check
                )
            ).first()
            
            if existing_lead:
                raise ValueError(f"Phone number {update_data['phone']} already exists for this user")
        
        for field, value in update_data.items():
            setattr(lead, field, value)
        
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def delete_lead(self, lead_id: int, user_id: int) -> bool:
        """Delete a lead for the specified user"""
        lead = self.get_lead(lead_id, user_id)
        if not lead:
            return False
        
        self.db.delete(lead)
        self.db.commit()
        return True

    def import_leads_from_csv(self, content: bytes, user_id: int) -> Dict:
        """Import leads from CSV content for the specified user"""
        try:
            # Read CSV content
            df = pd.read_csv(io.BytesIO(content))
            
            imported_count = 0
            errors = []
            
            for index, row in df.iterrows():
                try:
                    # Validate required fields
                    if pd.isna(row.get('name')) or pd.isna(row.get('phone')):
                        errors.append(f"Row {index + 1}: Missing required fields (name or phone)")
                        continue
                    
                    # Check if phone already exists for this user
                    existing_lead = self.db.query(Lead).filter(
                        and_(Lead.phone == str(row['phone']), Lead.user_id == user_id)
                    ).first()
                    
                    if existing_lead:
                        errors.append(f"Row {index + 1}: Phone number {row['phone']} already exists for this user")
                        continue
                    
                    # Create lead data
                    lead_data = {
                        'name': str(row['name']),
                        'phone': str(row['phone']),
                        'email': str(row.get('email', '')) if not pd.isna(row.get('email')) else None,
                        'company': str(row.get('company', '')) if not pd.isna(row.get('company')) else None,
                        'title': str(row.get('title', '')) if not pd.isna(row.get('title')) else None,
                        'address': str(row.get('address', '')) if not pd.isna(row.get('address')) else None,
                        'notes': str(row.get('notes', '')) if not pd.isna(row.get('notes')) else None,
                        'priority': int(row.get('priority', 3)) if not pd.isna(row.get('priority')) else 3,
                        'status': str(row.get('status', 'pending')) if not pd.isna(row.get('status')) else 'pending',
                        'user_id': user_id
                    }
                    
                    # Create the lead
                    db_lead = Lead(**lead_data)
                    self.db.add(db_lead)
                    imported_count += 1
                    
                except Exception as e:
                    errors.append(f"Row {index + 1}: {str(e)}")
                    continue
            
            self.db.commit()
            return {
                'imported_count': imported_count,
                'errors': errors
            }
            
        except Exception as e:
            logger.error(f"Error importing leads: {str(e)}")
            raise ValueError(f"Failed to import leads: {str(e)}")

    def get_lead_statistics(self, user_id: int) -> Dict:
        """Get lead statistics for the specified user"""
        try:
            total_leads = self.db.query(Lead).filter(Lead.user_id == user_id).count()
            
            # Status breakdown
            pending_leads = self.db.query(Lead).filter(
                and_(Lead.user_id == user_id, Lead.status == "pending")
            ).count()
            
            scheduled_leads = self.db.query(Lead).filter(
                and_(Lead.user_id == user_id, Lead.status == "scheduled")
            ).count()
            
            called_leads = self.db.query(Lead).filter(
                and_(Lead.user_id == user_id, Lead.status == "called")
            ).count()
            
            not_interested_leads = self.db.query(Lead).filter(
                and_(Lead.user_id == user_id, Lead.status == "not_interested")
            ).count()
            
            # Calculate conversion rate
            conversion_rate = ((scheduled_leads + called_leads) / total_leads * 100) if total_leads > 0 else 0.0
            
            return {
                'total_leads': total_leads,
                'pending_leads': pending_leads,
                'scheduled_leads': scheduled_leads,
                'called_leads': called_leads,
                'not_interested_leads': not_interested_leads,
                'conversion_rate': conversion_rate
            }
            
        except Exception as e:
            logger.error(f"Error getting lead statistics: {str(e)}")
            return {
                'total_leads': 0,
                'pending_leads': 0,
                'scheduled_leads': 0,
                'called_leads': 0,
                'not_interested_leads': 0,
                'conversion_rate': 0.0
            } 