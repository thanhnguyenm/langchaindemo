from fastapi import APIRouter, HTTPException, Depends
from utils.database import get_db_connection
from typing import Dict, Any
from datetime import datetime
from routes.routes_authentication import get_current_user_email

from utils.logging_setup import logger
from utils.user_util import load_session


router = APIRouter(prefix="/api/user", tags=["user"])

@router.get("/session", response_model=Dict[str, Any])
async def get_user_session(user_email: str = Depends(get_current_user_email)):
    """
    Get or create user session using stored procedure sp_GetUserSession
    """
    try:
        logger.info(f"Getting session for user: {user_email}")
        user_session = load_session(user_email)
        session_data = {
            "session_id": user_session.session_id,
            "is_active": user_session.is_active,                
            "created_date": user_session.created_date,
            "modified_date": user_session.modified_date,
            "session_agents": user_session.session_agents,
            "usage_statistics": user_session.usage_statistics
        }
        return session_data
        
    except Exception as e:
        logger.error(f"Error managing user session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to manage user session: {str(e)}")

@router.get("/usage/current-month")
async def get_current_month_usage(user_email: str = Depends(get_current_user_email)):
    """
    Get current month token usage for user
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        current_month = datetime.now().strftime('%Y-%m')
        
        cursor.execute("""
            SELECT 
                UserEmail,
                UsageMonth,
                TotalTokensCurrentMonth,
                TotalRequestsCurrentMonth,
                LastUsageDate
            FROM user_monthly_usage
            WHERE UserEmail = ? AND UsageMonth = ?
        """, user_email, current_month)
        
        usage_row = cursor.fetchone()
        
        if usage_row:
            usage_data = {
                "user_email": usage_row[0],
                "usage_month": usage_row[1],
                "total_tokens": usage_row[2],
                "total_messages": usage_row[3],
                "last_updated": usage_row[4].isoformat() if usage_row[4] else None
            }
        else:
            usage_data = {
                "user_email": user_email,
                "usage_month": current_month,
                "total_tokens": 0,
                "total_messages": 0,
                "last_updated": None
            }
        
        conn.close()
        return usage_data
        
    except Exception as e:
        logger.error(f"Error getting usage data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get usage data: {str(e)}")

@router.post("/usage/record")
async def record_usage(request: Dict[str, Any], user_email: str = Depends(get_current_user_email)):
    """
    Record token usage for user session
    """
    agent_id = request.get("agent_id")
    tokens_used = request.get("tokens_used", 0)
    message_count = request.get("message_count", 0)
    
    if not agent_id or not tokens_used:
        raise HTTPException(status_code=400, detail="Missing required parameters: agent_id and tokens_used")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        logger.info(f"Recording usage for user: {user_email}, tokens: {tokens_used}")
        
        # Get current session
        cursor.execute("""
            SELECT SessionID
            FROM user_current_session
            WHERE UserEmail = ? AND IsActive = 1
        """, user_email)
        
        session_row = cursor.fetchone()
        if not session_row:
            raise HTTPException(status_code=404, detail="No active session found")
        
        session_id = session_row[0]
        
        # Record usage in user_agent_usage
        cursor.execute("""
            INSERT INTO user_agent_usage 
            (UserEmail, AgentID, SessionID, TokensUsed, MessageCount, UsageDate)
            VALUES (?, ?, ?, ?, ?, GETDATE())
        """, user_email, agent_id, session_id, tokens_used, message_count)
        
        # Update monthly usage
        current_month = datetime.now().strftime('%Y-%m')
        cursor.execute("""
            IF EXISTS (SELECT 1 FROM user_monthly_usage WHERE UserEmail = ? AND UsageMonth = ?)
            BEGIN
                UPDATE user_monthly_usage
                SET TotalTokens = TotalTokens + ?,
                    TotalMessages = TotalMessages + ?,
                    LastUpdated = GETDATE()
                WHERE UserEmail = ? AND UsageMonth = ?
            END
            ELSE
            BEGIN
                INSERT INTO user_monthly_usage (UserEmail, UsageMonth, TotalTokens, TotalMessages, FirstUsed, LastUpdated)
                VALUES (?, ?, ?, ?, GETDATE(), GETDATE())
            END
        """, user_email, current_month, tokens_used, message_count, user_email, current_month, 
             user_email, current_month, tokens_used, message_count)
        
        # Update session activity
        cursor.execute("""
            UPDATE user_current_session
            SET LastActivityDate = GETDATE()
            WHERE SessionID = ?
        """, session_id)
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Usage recorded successfully",
            "tokens_recorded": tokens_used,
            "messages_recorded": message_count
        }
        
    except Exception as e:
        logger.error(f"Error recording usage: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to record usage: {str(e)}")


@router.post("/agents/launch")
async def launch_agent(request: Dict[str, Any], user_email: str = Depends(get_current_user_email)):
    """
    Launch/register an agent in the current user session
    """
    from utils.user_util import register_agent_to_session
    try:
        agent_id = request.get("agent_id")
        
        if not agent_id:
            raise HTTPException(status_code=400, detail="agent_id is required")

        # Register the agent to the user's session
        success = register_agent_to_session(user_email, agent_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to register agent to session")

        return {
            "success": True,
            "message": f"Agent {agent_id} launched successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error launching agent: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to launch agent: {str(e)}")