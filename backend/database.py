"""
Database configuration for ConflictCanvas
Supports PostgreSQL and SQLite
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os


# Database URL - configure via environment variable
# Defaults to SQLite for local zero-config development, or PostgreSQL in production
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./conflictcanvas.db"
)

# SQLite requires check_same_thread=False for multi-threaded FastAPI requests
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# Create engine
engine = create_engine(DATABASE_URL, connect_args=connect_args)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
