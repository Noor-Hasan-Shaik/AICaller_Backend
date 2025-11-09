from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey, UniqueConstraint, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

# Association table for many-to-many relationship between leads and groups
lead_groups = Table(
    'lead_groups',
    Base.metadata,
    Column('lead_id', Integer, ForeignKey('leads.id'), primary_key=True),
    Column('group_id', Integer, ForeignKey('groups.id'), primary_key=True)
)

class User(Base):
    """User model for authentication"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=True, index=True)  # Made nullable for auto-generation
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    industry = Column(String(100))  # New field
    mobile = Column(String(20))  # New field
    country_code = Column(String(10))  # New field
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Lead(Base):
    """Lead model for storing lead information"""
    __tablename__ = "leads"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)  # Removed global unique constraint
    email = Column(String(255))
    company = Column(String(255))
    title = Column(String(255))
    address = Column(Text)
    notes = Column(Text)
    priority = Column(Integer, default=3)  # 1-5 scale
    status = Column(String(50), default="pending")  # pending, scheduled, calling, called, not_interested
    user_id = Column(Integer, ForeignKey("users.id"))  # Associate leads with users
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="leads")
    calls = relationship("Call", back_populates="lead")
    groups = relationship("Group", secondary=lead_groups, back_populates="leads")
    
    # Composite unique constraint on phone and user_id
    __table_args__ = (
        UniqueConstraint('phone', 'user_id', name='uq_lead_phone_user'),
    )

class Group(Base):
    """Group model for organizing leads"""
    __tablename__ = "groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="groups")
    leads = relationship("Lead", secondary=lead_groups, back_populates="groups")
    group_calls = relationship("GroupCall", back_populates="group")

class Call(Base):
    """Call model for storing call records"""
    __tablename__ = "calls"
    
    id = Column(Integer, primary_key=True, index=True)
    call_sid = Column(String(255), unique=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    user_id = Column(Integer, ForeignKey("users.id"))  # Associate calls with users
    phone_number = Column(String(20), nullable=False)
    status = Column(String(50), default="initiated")  # initiated, answered, completed, failed
    outcome = Column(String(50))  # meeting_scheduled, answered, no_answer, busy, rejected
    duration = Column(Integer, default=0)  # in seconds
    recording_url = Column(String(500))
    meeting_url = Column(String(500))
    purpose = Column(String(50), default="general")  # feedback, upsell, custom_purpose
    custom_prompt = Column(Text)  # For custom purpose calls
    additional_notes = Column(Text)  # Additional notes for the call
    group_call_id = Column(Integer, ForeignKey("group_calls.id"), nullable=True)  # Link to group call if applicable
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    lead = relationship("Lead", back_populates="calls")
    user = relationship("User", back_populates="calls")
    conversation_messages = relationship("ConversationMessage", back_populates="call")
    group_call = relationship("GroupCall", back_populates="calls")

class GroupCall(Base):
    """Group call model for managing group call queues"""
    __tablename__ = "group_calls"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String(50), default="queued")  # queued, in_progress, completed, paused
    purpose = Column(String(50), default="general")  # feedback, upsell, custom_purpose
    custom_prompt = Column(Text)  # For custom purpose calls
    additional_notes = Column(Text)  # Additional notes for the group call
    current_lead_index = Column(Integer, default=0)  # Track current position in queue
    total_leads = Column(Integer, default=0)  # Total number of leads in group
    completed_calls = Column(Integer, default=0)  # Number of completed calls
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    group = relationship("Group", back_populates="group_calls")
    user = relationship("User", back_populates="group_calls")
    calls = relationship("Call", back_populates="group_call")

class ConversationMessage(Base):
    """Conversation message model for storing AI conversation history"""
    __tablename__ = "conversation_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("calls.id"))
    role = Column(String(20), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    call = relationship("Call", back_populates="conversation_messages")

class SystemStatus(Base):
    """System status model for storing scheduler and queue information"""
    __tablename__ = "system_status"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))  # Associate status with users
    scheduler_running = Column(Boolean, default=False)
    active_calls = Column(Integer, default=0)
    queue_health = Column(String(50), default="unknown")  # healthy, warning, critical
    overdue_calls = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="system_status")

# Add relationships to User model
User.leads = relationship("Lead", back_populates="user")
User.calls = relationship("Call", back_populates="user")
User.groups = relationship("Group", back_populates="user")
User.group_calls = relationship("GroupCall", back_populates="user")
User.system_status = relationship("SystemStatus", back_populates="user") 