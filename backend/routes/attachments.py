"""
Attachment routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas.attachment import AttachmentCreate, AttachmentResponse
from models.attachment import Attachment
from models.task import Task
from models.user import User
from routes.auth import get_current_user


router = APIRouter()


@router.get("/task/{task_id}", response_model=List[AttachmentResponse])
async def get_task_attachments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return db.query(Attachment).filter(Attachment.task_id == task_id).all()


@router.post("/task/{task_id}", response_model=AttachmentResponse, status_code=status.HTTP_201_CREATED)
async def create_attachment(
    task_id: int,
    attachment_data: AttachmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    new_attachment = Attachment(
        task_id=task_id,
        user_id=current_user.id,
        filename=attachment_data.filename,
        file_path=attachment_data.file_path,
        file_size=attachment_data.file_size,
        file_type=attachment_data.file_type
    )
    db.add(new_attachment)
    db.commit()
    db.refresh(new_attachment)
    return new_attachment


@router.delete("/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )
    
    if attachment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete another user's attachment"
        )
    
    db.delete(attachment)
    db.commit()
    return None
