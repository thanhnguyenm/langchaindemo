from utils.database import get_db_connection
from models.user_session import UserSession
from utils.logging_setup import logger

def load_session(user_email: str):
    """Load user session from the database"""
    conn = None
    cursor = None
    
    try:
        user_session = UserSession(user_email)

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("EXEC sp_CreateOrGetUserSession @UserEmail = ?", user_email)
        row = cursor.fetchone()
        if row:
            user_session.session_id = row.SessionID
            user_session.is_active = True
            user_session.created_date = row.SessionCreatedDate
            user_session.modified_date = row.SessionModifiedDate

            # Move to next result set (session agents)
            cursor.nextset()
            user_session.session_agents = []
            if cursor.description:  # Check if there are results
                agent_rows = cursor.fetchall()
                for agent_row in agent_rows:
                    user_session.session_agents.append({
                        "session_agent_id": agent_row[0],
                        "session_id": agent_row[1],
                        "agent_id": agent_row[2],
                        "agent_code": agent_row[11],
                        "agent_name": agent_row[3],
                        "agent_icon": agent_row[4],
                        "is_active": agent_row[5],
                        "launched_date": agent_row[6].isoformat() if agent_row[6] else None,
                        "created_date": agent_row[7].isoformat() if agent_row[7] else None,
                        "modified_date": agent_row[8].isoformat() if agent_row[8] else None,
                        "agent_description": agent_row[9],
                        "agent_system_prompt": agent_row[10]
                    })
            
            # Move to next result set (monthly usage)
            cursor.nextset()
            usage_row = cursor.fetchone()
            current_month_tokens = usage_row[0] if usage_row else 0
            current_month_messages = usage_row[1] if usage_row else 0
            current_month_threads = usage_row[2] if usage_row else 0
            user_session.usage_statistics = {
                "current_month_tokens": current_month_tokens,
                "current_month_messages": current_month_messages,
                "current_month_threads": current_month_threads
            }
            
        return user_session
      
    except Exception as e:
        logger.error(f"Error loading user session: {e}")
        raise Exception(f"Failed to load user session: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
  
def register_agent_to_session(user_email: str, agent_id: int):
    """Register an agent to the user's session"""
    conn = None
    cursor = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First, get the user's session
        cursor.execute("""
            SELECT SessionID FROM [dbo].[user_current_session] 
            WHERE UserEmail = ? AND IsActive = 1
            ORDER BY CreatedDate DESC
        """, user_email)
        
        session_row = cursor.fetchone()
        if not session_row:
            raise Exception("No active session found for user.")
        
        session_id = session_row[0]
        
        # Check if agent is already in the session
        cursor.execute("""
            SELECT SessionAgentID FROM [dbo].[user_session_agents]
            WHERE SessionID = ? AND AgentID = ?
        """, session_id, agent_id)
        
        existing_agent = cursor.fetchone()
        if existing_agent:
            logger.info(f"Agent {agent_id} already registered in session {session_id}")
            return  # Agent already registered
        
         # Get agent details to add to session
        cursor.execute("""
            SELECT AgentName, Icon FROM [dbo].[agents] 
            WHERE AgentID = ? AND Active = 1
        """, agent_id)
        
        agent_row = cursor.fetchone()
        if not agent_row:
            raise Exception(f"Agent {agent_id} not found or inactive.")
        
        agent_name = agent_row[0]
        agent_icon = agent_row[1] if len(agent_row) > 1 else '🤖'
        
        # Add agent to session
        cursor.execute("""
            INSERT INTO [dbo].[user_session_agents] 
            (SessionID, AgentID, AgentName, AgentIcon, IsActive, LaunchedDate, CreatedDate, ModifiedDate)
            VALUES (?, ?, ?, ?, 1, GETUTCDATE(), GETUTCDATE(), GETUTCDATE())
        """, session_id, agent_id, agent_name, agent_icon)
              
        conn.commit()
        return True
        
    except Exception as e:
        logger.error(f"Error registering agent to session: {str(e)}")
        raise Exception(f"Failed to register agent to session: {str(e)}")
      
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
    
    return False
