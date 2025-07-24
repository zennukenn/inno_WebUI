"""Database initialization utilities"""

import logging
from sqlalchemy import text
from app.database import engine, Base
from app.models.chat import Chat, Message

logger = logging.getLogger(__name__)

def create_tables():
    """Create all database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

def check_database_connection():
    """Check if database connection is working"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            result.fetchone()
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False

def initialize_database():
    """Initialize the database with tables and basic setup"""
    logger.info("Initializing database...")
    
    if not check_database_connection():
        raise Exception("Cannot connect to database")
    
    create_tables()
    logger.info("Database initialization completed")

if __name__ == "__main__":
    initialize_database()
