from asyncio import threads
from utils.database import get_db_connection
from models.user_session import UserSession
from utils.logging_setup import logger
from utils.common_funtions import is_valid_uuid
import datetime


def save_agent_thread_message(thread_id: str, agent_code: str, message_content: str, input_tokens: int, output_tokens: int) -> str:
    """
    Save a message sent by an agent to a thread in the database using stored procedure sp_AddThreadMessage.
    Returns the ID of the saved message.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        if not is_valid_uuid(thread_id):
            raise ValueError("Invalid thread_id format. Must be a valid UUID.")

        logger.info(f"Saving agent message to thread {thread_id} for agent {agent_code}")

        # Call the stored procedure to save the agent message
        cursor.execute("""
            EXEC [dbo].[sp_AddThreadMessage] 
                @ThreadID = ?, 
                @AgentCode = ?, 
                @Content = ?, 
                @InputTokens = ?,
                @OutputTokens = ?;
        """, thread_id, agent_code, message_content, input_tokens, output_tokens)

        # Get the message ID from the result
        row = cursor.fetchone()
        conn.commit()
        if row and hasattr(row, 'MessageID'):
            message_id = str(row.MessageID)
            logger.info(f"Agent message saved with ID: {message_id}")
            return message_id
        else:
            # If no MessageID returned, we can get the last inserted identity
            cursor.execute("SELECT @@IDENTITY as MessageID")
            identity_row = cursor.fetchone()
            if identity_row:
                message_id = str(identity_row.MessageID)
                logger.info(f"Agent message saved with ID: {message_id}")
                return message_id
            else:
                raise Exception("Failed to retrieve MessageID after saving agent message.")

    except Exception as e:
        raise

    finally:
        if 'conn' in locals():
            conn.close()
            
            
def save_user_thread_message(thread_id: str, message_content: str) -> str:
    """
    Save a message sent by a user to a thread in the database using stored procedure sp_AddThreadMessage.
    Returns the ID of the saved message.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        if not is_valid_uuid(thread_id):
            raise ValueError("Invalid thread_id format. Must be a valid UUID.")

        logger.info(f"Saving user message to thread {thread_id}")

        # Call the stored procedure to save the user message
        cursor.execute("""
            EXEC [dbo].[sp_AddThreadMessage] 
                @ThreadID = ?, 
                @AgentCode = NULL, 
                @Content = ?, 
                @InputTokens = 0,
                @OutputTokens = 0;
        """, thread_id, message_content)

        # Get the message ID from the result
        row = cursor.fetchone()
        conn.commit()
        
        if row and hasattr(row, 'MessageID'):
            message_id = str(row.MessageID)
            logger.info(f"Agent message saved with ID: {message_id}")
            return message_id
        else:
            # If no MessageID returned, we can get the last inserted identity
            cursor.execute("SELECT @@IDENTITY as MessageID")
            identity_row = cursor.fetchone()
            if identity_row:
                message_id = str(identity_row.MessageID)
                logger.info(f"Agent message saved with ID: {message_id}")
                return message_id
            else:
                raise Exception("Failed to retrieve MessageID after saving agent message.")
            
    except Exception as e:
        raise

    finally:
        if 'conn' in locals():
            conn.close()

def get_thread_by_id(user_email: str, current_thread_id: str):
    """Get the current or latest thread for the user"""
    conn = None
    cursor = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        thread_data = None
        
        if current_thread_id and is_valid_uuid(current_thread_id):
            # Fetch specified thread
            cursor.execute("""
                SELECT 
                    ThreadID, 
                    ThreadTitle, 
                    ThreadIcon, 
                    IsActive, 
                    TotalMessages, 
                    TotalTokens, 
                    LastActivityDate, 
                    CreatedDate, 
                    ModifiedDate
                FROM user_threads
                WHERE UserEmail = ? AND ThreadID = ?
            """, user_email, current_thread_id)
        
            thread_row = cursor.fetchone()
            if not thread_row:
                return None
            
            thread_data = {
                "thread_id": thread_row[0],
                "thread_title": thread_row[1],
                "thread_icon": thread_row[2],
                "is_active": thread_row[3],
                "total_messages": thread_row[4],
                "total_tokens": thread_row[5],
                "last_activity_date": thread_row[6].isoformat() if thread_row[6] else None,
                "created_date": thread_row[7].isoformat() if thread_row[7] else None,
                "modified_date": thread_row[8].isoformat() if thread_row[8] else None
            }
        
        return thread_data
      
    except Exception as e:
        raise
      
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def get_threads_by_user(user_email: str):
    """Get the current or latest thread for the user"""
    conn = None
    cursor = None
    threads = []
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            EXEC [dbo].[sp_GetUserThreads] 
                @UserEmail = ?;
        """, user_email)
        
        for row in cursor.fetchall():
            thread_data = {
                "thread_id": str(row[0]),  # Convert GUID to string
                "user_email": row[1],
                "thread_title": row[2],
                "thread_icon": row[3],
                "is_active": row[4],
                "total_messages": row[5],
                "total_tokens": row[6],
                "last_activity_date": row[7].isoformat() if row[7] else None,
                "created_date": row[8].isoformat() if row[8] else None,
                "modified_date": row[9].isoformat() if row[9] else None
            }
            
            threads.append(thread_data)
      
        return threads
      
    except Exception as e:
        logger.error(f"Error fetching thread: {str(e)}")
        raise Exception(f"Failed to fetch thread: {str(e)}")
      
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def get_thread_messages_by_thread_id(thread_id: str, user_email: str):
    """Get the current or latest thread for the user"""
    conn = None
    cursor = None
    messages = []
    try:
        if not is_valid_uuid(thread_id):
            raise ValueError("Invalid thread_id format. Must be a valid UUID.")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            EXEC [dbo].[sp_GetThreadMessages] 
                @ThreadID = ?, @UserEmail = ?;
        """, thread_id, user_email)
        
        for row in cursor.fetchall():
            message = {
                "message_id": row[0],
                "thread_id": str(row[1]),
                "agent_id": row[2],
                "agent_name": row[3],
                "role": row[4],
                "content": row[5],
                "input_tokens": row[6],
                "output_tokens": row[7],
                "total_tokens": row[8],
                "message_order": row[9],
                "is_edited": row[10],
                "edited_date": row[11].isoformat() if row[11] else None,
                "created_date": row[12].isoformat() if row[12] else None,
                "modified_date": row[13].isoformat() if row[13] else None
            }
            
            messages.append(message)
      
        return messages 
      
    except Exception as e:
        raise Exception(f"Failed to fetch thread messages: {str(e)}")
      
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def create_thread(user_email: str, thread_title: str = "New Chat", thread_icon: str = "💬"):
    """Create a new thread for the user"""
    conn = None
    cursor = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # No threads found, create a new one
        cursor.execute("""
            INSERT INTO [dbo].[user_threads] 
            (ThreadID, UserEmail, ThreadTitle, ThreadIcon, IsActive, TotalMessages, TotalTokens, 
              LastActivityDate, CreatedDate, ModifiedDate)
            OUTPUT INSERTED.ThreadID, INSERTED.ThreadTitle
            VALUES (NEWID(), ?, ?, ?, 1, 0, 0, GETDATE(), GETDATE(), GETDATE())
        """, user_email, thread_title, thread_icon)
        
        thread_row = cursor.fetchone()
        if not thread_row:
            raise Exception("Failed to create new thread.")
        
        thread_id = thread_row[0]
        
        conn.commit()
                
        thread_data = {
            "thread_id": thread_id,
            "thread_title": thread_title,
            "created_date": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "modified_date": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        
        logger.error(f"Created new thread: {thread_data}")
        
        return thread_data
      
    except Exception as e:
        logger.error(f"Error creating thread: {str(e)}")
        raise Exception(f"Failed to create thread: {str(e)}")
      
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            
def count_thread_messages(thread_id: str) -> int:
    """Count the number of messages in a thread"""
    conn = None
    cursor = None
    message_count = 0
    try:
        if thread_id and is_valid_uuid(thread_id):
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT COUNT(*) FROM user_messages
                WHERE ThreadID = ?
            """, thread_id)
          
            row = cursor.fetchone()
            message_count = row[0] if row else 0
          
        return message_count
      
    except Exception as e:
        logger.error(f"Error counting messages in thread: {str(e)}")
        raise Exception(f"Failed to count messages in thread: {str(e)}")
      
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def get_latest_thread(user_email: str):
    """Get the current or latest thread for the user"""
    conn = None
    cursor = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        thread_data = None
        
        cursor.execute("""
            SELECT TOP 1 
                ThreadID, 
                ThreadTitle, 
                ThreadIcon, 
                IsActive, 
                TotalMessages, 
                TotalTokens, 
                LastActivityDate, 
                CreatedDate, 
                ModifiedDate
            FROM [dbo].[user_threads]
            WHERE UserEmail = ? AND IsActive = 1
            ORDER BY ModifiedDate DESC, LastActivityDate DESC, CreatedDate DESC
        """, user_email)
            
        
        thread_row = cursor.fetchone()
        if not thread_row:
            return None
        
        thread_data = {
            "thread_id": thread_row[0],
            "thread_title": thread_row[1],
            "thread_icon": thread_row[2],
            "is_active": thread_row[3],
            "total_messages": thread_row[4],
            "total_tokens": thread_row[5],
            "last_activity_date": thread_row[6].isoformat() if thread_row[6] else None,
            "created_date": thread_row[7].isoformat() if thread_row[7] else None,
            "modified_date": thread_row[8].isoformat() if thread_row[8] else None
        }
        
        return thread_data
      
    except Exception as e:
        raise
      
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            
def update_thread(thread_id: str, thread_title: str = None, thread_icon: str = None, is_active: bool = None):
    """Update thread details"""
    conn = None
    cursor = None
    
    try:
        if not is_valid_uuid(thread_id):
            raise ValueError("Invalid thread_id format. Must be a valid UUID.")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        update_fields = []
        params = []
        
        if thread_title is not None:
            update_fields.append("ThreadTitle = ?")
            params.append(thread_title)
        
        if thread_icon is not None:
            update_fields.append("ThreadIcon = ?")
            params.append(thread_icon)
        
        if is_active is not None:
            update_fields.append("IsActive = ?")
            params.append(1 if is_active else 0)
        
        if not update_fields:
            raise ValueError("No fields to update.")
        
        update_fields.append("ModifiedDate = GETDATE()")
        
        sql = f"""
            UPDATE [dbo].[user_threads]
            SET {', '.join(update_fields)}
            WHERE ThreadID = ?
        """
        params.append(thread_id)
        
        cursor.execute(sql, *params)
        conn.commit()
        
    except Exception as e:
        logger.error(f"Error updating thread: {str(e)}")
        raise Exception(f"Failed to update thread: {str(e)}")
      
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()