"""
Project schemas
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: Optional[str] = "active"
    priority: Optional[str] = "medium"


class ProjectCreate(ProjectBase):
    deadline: Optional[datetime] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    progress: Optional[int] = None
    deadline: Optional[datetime] = None


class ProjectResponse(ProjectBase):
    id: int
    progress: int
    deadline: Optional[datetime] = None
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
