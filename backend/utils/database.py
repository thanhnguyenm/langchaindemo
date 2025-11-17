import pyodbc
import os
from dotenv import load_dotenv
from utils.logging_setup import logger

# Load environment variables
load_dotenv()

def get_db_connection():
    """Get database connection"""
    try:
        connection_string = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={os.getenv('SERVER')};"
            f"DATABASE={os.getenv('DATABASE')};"
            f"UID={os.getenv('USERID')};"
            f"PWD={os.getenv('PASSWORD')};"
            f"TrustServerCertificate=yes;"
        )
        return pyodbc.connect(connection_string)
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise