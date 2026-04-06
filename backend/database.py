from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL + PostGIS Connection URL from .env
# Example: postgresql://user:password@localhost:5432/dbname
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./safecity_v2.db")

# To support PostGIS, PostgreSQL is required. 
# For SQLite, it will fallback to simple columns.
engine = create_engine(
    DATABASE_URL, 
    # check_same_thread ONLY for sqlite
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
