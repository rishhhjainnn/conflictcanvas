"""
ActivityLog model for tracking all activity
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    action = Column(String, nullable=False)  # e.g., "task_created", "status_changed"
    entity_type = Column(String, nullable=False)  # e.g., "task", "project", "comment"
    entity_id = Column(Integer, nullable=True)
    
    details = Column(Text, nullable=True)  # JSON string with additional details
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
