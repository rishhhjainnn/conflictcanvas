"""
Conflict resolution routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas.conflict import ConflictResolve, ConflictResponse
from models.conflict import Conflict, ConflictStatus, ConflictResolution
from models.task import Task
from routes.auth import get_current_user
from models.user import User
from datetime import datetime
import json


router = APIRouter()


@router.get("", response_model=List[ConflictResponse])
async def get_conflicts(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Conflict)
    if status:
        query = query.filter(Conflict.status == status)
    conflicts = query.order_by(Conflict.created_at.desc()).all()
    return conflicts


@router.get("/{conflict_id}", response_model=ConflictResponse)
async def get_conflict(
    conflict_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conflict = db.query(Conflict).filter(Conflict.id == conflict_id).first()
    if not conflict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conflict not found"
        )
    return conflict


@router.post("/{conflict_id}/resolve", response_model=ConflictResponse)
async def resolve_conflict(
    conflict_id: int,
    resolution_data: ConflictResolve,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conflict = db.query(Conflict).filter(Conflict.id == conflict_id).first()
    if not conflict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conflict not found"
        )
    
    if conflict.status != ConflictStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conflict is already resolved"
        )
    
    task = db.query(Task).filter(Task.id == conflict.task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Apply resolution
    if resolution_data.resolution == ConflictResolution.KEEP_MINE:
        # Apply client changes
        if conflict.client_changes:
            client_data = json.loads(conflict.client_changes)
            for field, value in client_data.items():
                setattr(task, field, value)
    
    elif resolution_data.resolution == ConflictResolution.KEEP_LATEST:
        # Keep server changes (do nothing to task)
        pass
    
    elif resolution_data.resolution == ConflictResolution.SMART_MERGE:
        # Smart merge - apply non-conflicting fields from both
        if conflict.client_changes:
            client_data = json.loads(conflict.client_changes)
            if conflict.server_changes:
                server_data = json.loads(conflict.server_changes)
                
                # Merge fields that don't conflict
                for field, value in client_data.items():
                    if field not in server_data or server_data[field] == value:
                        setattr(task, field, value)
    
    # Update task version
    task.version += 1
    task.updated_by = current_user.id
    
    # Mark conflict as resolved
    conflict.status = ConflictStatus.RESOLVED
    conflict.resolution = resolution_data.resolution
    conflict.resolved_by = current_user.id
    conflict.resolved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(conflict)
    
    return conflict
