"""
Attachment schemas
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AttachmentCreate(BaseModel):
    filename: str
    file_path: str
    file_size: int
    file_type: str


class AttachmentResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    filename: str
    file_path: str
    file_size: int
    file_type: str
    created_at: datetime

    class Config:
        from_attributes = True
