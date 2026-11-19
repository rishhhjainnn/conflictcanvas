"""
Task routes with version-based conflict detection
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas.task import TaskCreate, TaskUpdate, TaskResponse
from models.task import Task
from models.conflict import Conflict, ConflictStatus
from schemas.conflict import ConflictCreate
from routes.auth import get_current_user
from models.user import User
import json


router = APIRouter()


@router.get("/project/{project_id}", response_model=List[TaskResponse])
async def get_project_tasks(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
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
    return task


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_task = Task(
        **task_data.model_dump(),
        created_by=current_user.id,
        updated_by=current_user.id,
        version=1
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Conflict detection
    if task_data.base_version is not None:
        if task_data.base_version != task.version:
            # Conflict detected - create conflict record
            conflict = Conflict(
                task_id=task.id,
                user_id=current_user.id,
                base_version=task_data.base_version,
                server_version=task.version,
                conflict_field="multiple",
                client_changes=json.dumps(task_data.model_dump(exclude={"base_version"})),
                server_changes=json.dumps({
                    "title": task.title,
                    "status": task.status,
                    "priority": task.priority
                }),
                status=ConflictStatus.OPEN
            )
            db.add(conflict)
            db.commit()
            
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="CONFLICT_DETECTED",
                headers={"X-Conflict-ID": str(conflict.id)}
            )
    
    # Smart merge logic
    update_data = task_data.model_dump(exclude_unset=True, exclude={"base_version"})
    
    # Apply updates
    for field, value in update_data.items():
        setattr(task, field, value)
    
    task.updated_by = current_user.id
    task.version += 1
    
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
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
    
    db.delete(task)
    db.commit()
    return None
