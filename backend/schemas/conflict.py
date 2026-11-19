"""
Conflict schemas
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ConflictBase(BaseModel):
    task_id: int
    conflict_field: str


class ConflictCreate(ConflictBase):
    base_version: int
    server_version: int
    client_changes: Optional[str] = None
    server_changes: Optional[str] = None


class ConflictResolve(BaseModel):
    resolution: str  # "keep_mine", "keep_latest", "smart_merge"


class ConflictResponse(ConflictBase):
    id: int
    user_id: int
    base_version: int
    server_version: int
    client_changes: Optional[str] = None
    server_changes: Optional[str] = None
    status: str
    resolution: Optional[str] = None
    resolved_by: Optional[int] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
