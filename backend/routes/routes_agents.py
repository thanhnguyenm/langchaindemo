from fastapi import APIRouter, HTTPException, Depends
from utils.database import get_db_connection
from dotenv import load_dotenv
from typing import List, Dict, Any

# Load environment variables
load_dotenv()

from utils.logging_setup import logger

router = APIRouter(prefix="/api/agents", tags=["agents"])

@router.get("/list", response_model=List[Dict[str, Any]])
async def get_all_agents():
    """Get all agents with their icons and tags"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Use stored procedure if available, otherwise direct query with tags
        try:
            logger.info("Attempting to execute sp_GetAgentsForUI stored procedure")
            cursor.execute("EXEC sp_GetAgentsForUI")
            columns = [column[0] for column in cursor.description]
            logger.info(f"Stored procedure returned columns: {columns}")
        except Exception as sp_error:
            logger.warning(f"Stored procedure failed: {sp_error}. Trying fallback query...")
            
            # Fallback to direct query with tags if stored procedure doesn't exist
            cursor.execute("""
                SELECT 
                    a.AgentID as AgentId,
                    a.AgentCode,
                    a.AgentName,
                    a.Description,
                    a.Instruments,
                    a.SystemPrompt,
                    a.Icon,
                    a.Active as IsActive,
                    a.CreatedDate,
                    a.CreatedBy,
                    a.ModifiedDate,
                    a.ModifiedBy,
                    a.NumberOfUses,
                    STRING_AGG(ISNULL(at.TagName, ''), ',') as Tags
                FROM agents a
                LEFT JOIN agent_tags at ON a.AgentID = at.AgentID
                WHERE a.Active = 1
                GROUP BY a.AgentID, a.AgentCode, a.AgentName, a.Description, a.Instruments, a.SystemPrompt, 
                         a.Icon, a.Active, a.CreatedDate, a.CreatedBy, a.ModifiedDate, a.ModifiedBy, a.NumberOfUses
                ORDER BY a.AgentName
            """)
            columns = [column[0] for column in cursor.description]
            logger.info(f"Fallback query returned columns: {columns}")
        agents = []
        
        for row in cursor.fetchall():
            agent = dict(zip(columns, row))
            # Convert datetime objects to strings for JSON serialization
            for key, value in agent.items():
                if hasattr(value, 'isoformat'):
                    agent[key] = value.isoformat()
            
            # Convert comma-separated tags to array and limit to 3 tags
            if agent.get('Tags'):
                # Remove empty strings and strip whitespace
                all_tags = [tag.strip() for tag in agent['Tags'].split(',') if tag.strip()]
                
                # Limit to first 3 tags and add "+n" if there are more
                if len(all_tags) <= 3:
                    agent['Tags'] = all_tags
                else:
                    displayed_tags = all_tags[:3]
                    remaining_count = len(all_tags) - 3
                    displayed_tags.append(f"+{remaining_count}")
                    agent['Tags'] = displayed_tags
                
                logger.debug(f"Agent {agent.get('AgentName')} tags: {agent['Tags']} (total: {len(all_tags)})")
            else:
                agent['Tags'] = []
            
            agents.append(agent)
        
        logger.info(f"Successfully fetched {len(agents)} agents")
        conn.close()
        
        return agents
        
    except Exception as e:
        logger.error(f"Error fetching agents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch agents: {str(e)}")

