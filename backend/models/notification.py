"""
Notification model
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    type = Column(String, nullable=False)  # e.g., "task_assigned", "conflict_detected"
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    
    # Link to related entity
    link = Column(String, nullable=True)
    
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
