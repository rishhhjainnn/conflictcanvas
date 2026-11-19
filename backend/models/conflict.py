"""
Conflict model for tracking and resolving version conflicts
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import enum


class ConflictStatus(str, enum.Enum):
    OPEN = "open"
    RESOLVED = "resolved"


class ConflictResolution(str, enum.Enum):
    KEEP_MINE = "keep_mine"
    KEEP_LATEST = "keep_latest"
    SMART_MERGE = "smart_merge"


class Conflict(Base):
    __tablename__ = "conflicts"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Version information
    base_version = Column(Integer, nullable=False)
    server_version = Column(Integer, nullable=False)
    
    # Conflict details
    conflict_field = Column(String, nullable=False)
    client_changes = Column(Text, nullable=True)  # JSON string
    server_changes = Column(Text, nullable=True)  # JSON string
    
    # Resolution
    status = Column(Enum(ConflictStatus), default=ConflictStatus.OPEN)
    resolution = Column(Enum(ConflictResolution), nullable=True)
    resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    task = relationship("Task", back_populates="conflicts")
