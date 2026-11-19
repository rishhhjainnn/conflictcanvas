"""
Task schemas with version tracking
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "todo"
    priority: Optional[str] = "medium"


class TaskCreate(TaskBase):
    project_id: int
    assigned_to: Optional[int] = None
    deadline: Optional[datetime] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[int] = None
    deadline: Optional[datetime] = None
    base_version: Optional[int] = Field(None, description="Base version for conflict detection")


class TaskResponse(TaskBase):
    id: int
    project_id: int
    assigned_to: Optional[int] = None
    deadline: Optional[datetime] = None
    version: int
    created_by: int
    updated_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
