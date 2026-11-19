"""
Activity routes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.activity_log import ActivityLog
from routes.auth import get_current_user
from models.user import User


router = APIRouter()


@router.get("/project/{project_id}")
async def get_project_activity(
    project_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    activities = db.query(ActivityLog)\
        .filter(ActivityLog.project_id == project_id)\
        .order_by(ActivityLog.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return [
        {
            "id": activity.id,
            "user_id": activity.user_id,
            "action": activity.action,
            "entity_type": activity.entity_type,
            "entity_id": activity.entity_id,
            "details": activity.details,
            "created_at": activity.created_at
        }
        for activity in activities
    ]


@router.get("")
async def get_activity(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    activities = db.query(ActivityLog)\
        .order_by(ActivityLog.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return [
        {
            "id": activity.id,
            "project_id": activity.project_id,
            "task_id": activity.task_id,
            "user_id": activity.user_id,
            "action": activity.action,
            "entity_type": activity.entity_type,
            "entity_id": activity.entity_id,
            "details": activity.details,
            "created_at": activity.created_at
        }
        for activity in activities
    ]
