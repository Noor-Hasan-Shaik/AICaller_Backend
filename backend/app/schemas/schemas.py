from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Authentication Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    industry: Optional[str] = None
    mobile: Optional[str] = None
    country_code: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    industry: Optional[str] = None
    mobile: Optional[str] = None
    country_code: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    username: Optional[str] = None
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str  # This field name stays the same for API compatibility, but contains email
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None

# Lead Schemas
class LeadBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    company: Optional[str] = None
    title: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    priority: Optional[int] = 3

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    company: Optional[str] = None
    title: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    priority: Optional[int] = None
    status: Optional[str] = None

class Lead(LeadBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Group Schemas
class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None

class GroupCreate(GroupBase):
    lead_ids: Optional[List[int]] = None

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    lead_ids: Optional[List[int]] = None

class Group(GroupBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    leads: List[Lead] = []
    
    class Config:
        from_attributes = True

# Call Purpose Schemas
class CallPurpose(BaseModel):
    purpose: str  # feedback, upsell, custom_purpose
    custom_prompt: Optional[str] = None
    additional_notes: Optional[str] = None

# Call Schemas
class CallBase(BaseModel):
    phone_number: Optional[str] = None
    lead_id: int

class CallCreate(CallBase):
    purpose: Optional[str] = "general"  # feedback, upsell, custom_purpose
    custom_prompt: Optional[str] = None
    additional_notes: Optional[str] = None

class CallUpdate(BaseModel):
    status: Optional[str] = None
    outcome: Optional[str] = None
    duration: Optional[int] = None
    recording_url: Optional[str] = None
    meeting_url: Optional[str] = None
    purpose: Optional[str] = None
    custom_prompt: Optional[str] = None
    additional_notes: Optional[str] = None

class Call(CallBase):
    id: int
    call_sid: Optional[str] = None
    user_id: int
    status: str
    outcome: Optional[str] = None
    duration: int
    recording_url: Optional[str] = None
    meeting_url: Optional[str] = None
    purpose: str
    custom_prompt: Optional[str] = None
    additional_notes: Optional[str] = None
    group_call_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    lead: Lead
    
    class Config:
        from_attributes = True

# Group Call Schemas
class GroupCallBase(BaseModel):
    group_id: int
    purpose: Optional[str] = "general"  # feedback, upsell, custom_purpose
    custom_prompt: Optional[str] = None
    additional_notes: Optional[str] = None

class GroupCallCreate(GroupCallBase):
    pass

class GroupCallUpdate(BaseModel):
    status: Optional[str] = None
    purpose: Optional[str] = None
    custom_prompt: Optional[str] = None
    additional_notes: Optional[str] = None

class GroupCall(GroupCallBase):
    id: int
    user_id: int
    status: str
    current_lead_index: int
    total_leads: int
    completed_calls: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    group: Group
    calls: List[Call] = []
    
    class Config:
        from_attributes = True

# Conversation Message Schemas
class ConversationMessageBase(BaseModel):
    role: str
    content: str

class ConversationMessageCreate(ConversationMessageBase):
    call_id: int

class ConversationMessage(ConversationMessageBase):
    id: int
    call_id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

# System Status Schemas
class SystemStatusBase(BaseModel):
    scheduler_running: bool
    active_calls: int
    queue_health: str
    overdue_calls: int

class SystemStatus(SystemStatusBase):
    id: int
    user_id: int
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Statistics Schemas
class CallStats(BaseModel):
    total_calls: int
    answered_calls: int
    meetings_scheduled: int
    no_answer_calls: int
    rejected_calls: int
    avg_call_duration: float
    answer_rate: float
    meeting_rate: float
    call_trend: Optional[float] = None

class LeadStats(BaseModel):
    total_leads: int
    pending_leads: int
    scheduled_leads: int
    called_leads: int
    not_interested_leads: int
    conversion_rate: float

class GroupStats(BaseModel):
    total_groups: int
    total_leads_in_groups: int
    active_group_calls: int
    completed_group_calls: int

class QueueStats(BaseModel):
    queued_calls: int
    active_calls: int
    completed_calls: int
    failed_calls: int

class DashboardStats(BaseModel):
    call_stats: CallStats
    lead_stats: LeadStats
    group_stats: GroupStats
    queue_stats: QueueStats

# API Response Schemas
class HealthResponse(BaseModel):
    status: str
    message: str
    timestamp: datetime

class LeadListResponse(BaseModel):
    leads: List[Lead]
    total: int
    page: int
    per_page: int

class GroupListResponse(BaseModel):
    groups: List[Group]
    total: int
    page: int
    per_page: int

class CallListResponse(BaseModel):
    calls: List[Call]
    total: int
    page: int
    per_page: int

class GroupCallListResponse(BaseModel):
    group_calls: List[GroupCall]
    total: int
    page: int
    per_page: int

# AI Conversation Schemas
class ConversationRequest(BaseModel):
    lead_id: int
    message: str
    context: Optional[str] = None

class ConversationResponse(BaseModel):
    response: str
    call_sid: Optional[str] = None
    status: str

# File Upload Schemas
class FileUploadResponse(BaseModel):
    filename: str
    imported_count: int
    errors: List[str] = [] 