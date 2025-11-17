from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from utils.database import get_db_connection
from utils.logging_setup import logger
from utils.user_util import load_session
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional, AsyncGenerator
import datetime
import json
from utils.common_funtions import is_valid_uuid
from utils.threads_util import (
    save_agent_thread_message, 
    save_user_thread_message, 
    create_thread, 
    get_thread_by_id,
    get_threads_by_user,
    get_thread_messages_by_thread_id,
    get_latest_thread,
    update_thread
)
from langchain_core.messages import HumanMessage, AIMessage

from routes.routes_authentication import get_current_user_email
import agents.agent_controller
from agents.AgentsEnum import AgentsEnum
# Load environment variables
load_dotenv()

router = APIRouter(prefix="/api/threads", tags=["threads"])

@router.get("/list", response_model=List[Dict[str, Any]])
async def get_user_threads(user_email: str = Depends(get_current_user_email)):
    """
    Get all chat threads for the current user, ordered by most recent activity
    """
    try:
                
        logger.info(f"Getting threads for user: {user_email}")
        
        # Get all threads for the user, ordered by last activity date
        
        user_session = load_session(user_email)
        simple_agent = agents.agent_controller.get_simple_agent()
        
        threads = get_threads_by_user(user_email)
        for thread in threads:
            if thread["thread_title"] == "New Chat":
                messages = get_thread_messages_by_thread_id(thread["thread_id"], user_email)
                user_messages = [msg for msg in messages if msg["role"] == "User"]
                if user_messages and len(user_messages) > 1:
                    prompt = f"Generate a concise title for the following chat messages:\n\n{"\n".join([msg['content'] for msg in user_messages])}\n\n"
                    res = simple_agent.invoke(
                        {"messages": [{"role": "user", "content": prompt}]}
                    )
                    messages = res['messages'][-1]
                    thread["thread_title"] = messages.content.strip()
                    update_thread(thread["thread_id"], thread_title=thread["thread_title"])
        
        logger.info(f"Found {len(threads)} threads for user: {user_email}")
        return threads
        
    except Exception as e:
        logger.error(f"Error getting user threads: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get threads: {str(e)}")

@router.post("/create")
async def create_new_thread(
    request: Dict[str, Any], 
    user_email: str = Depends(get_current_user_email)
):
    """
    Create a new chat thread for the user
    """
    try:
        thread_title = request.get("thread_title", "New Chat")
        thread_icon = request.get("thread_icon", "💬")
        
        logger.info(f"Creating new thread for user: {user_email}")
        
        thread_data = create_thread(user_email, thread_title, thread_icon)
              
        return {
            "success": True,
            "thread_id": thread_data["thread_id"],
            "thread_title": thread_title,
            "thread_icon": thread_icon,
            "message": "Thread created successfully"
        }
        
    except Exception as e:
        logger.error(f"Error creating thread: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create thread: {str(e)}")

@router.get("/byid/{thread_id}/messages")
async def get_thread_messages(
    thread_id: str, 
    user_email: str = Depends(get_current_user_email)
):
    """
    Get all messages for a specific thread
    """
    try:
        # Validate UUID format
        if not is_valid_uuid(thread_id):
            raise HTTPException(status_code=400, detail="Invalid thread ID format")
            
        messages = get_thread_messages_by_thread_id(thread_id, user_email)
        
        return {
            "thread_id": thread_id,
            "messages": messages,
            "total_messages": len(messages)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting thread messages: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get messages: {str(e)}")

@router.get("/current/messages")
async def get_current_thread_messages(
    request: Request,
    user_email: str = Depends(get_current_user_email)
) -> JSONResponse:
    """
    Get messages for the current thread. 
    Checks FreddyAI_CurrentThread cookie, if not found gets the most recent thread.
    Sets the current thread cookie for future requests.
    """
    try:

        # Check for current thread cookie
        current_thread_id = request.cookies.get("FreddyAI_CurrentThread")
        current_thread = None
        logger.info(f"Getting current thread messages for user: {user_email}, cookie thread: {current_thread_id}")
        
        # If no cookie or thread doesn't exist/belong to user, get the most recent thread
        if current_thread_id and is_valid_uuid(current_thread_id):
            try:
                current_thread = get_thread_by_id(user_email, current_thread_id)
                logger.info(f"Current thread from cookie get_thread_by_id: {current_thread}")
                if current_thread:
                    current_thread_id = current_thread["thread_id"]  # Thread doesn't exist or doesn't belong to user
                
            except Exception as e:
                logger.error(f"Error getting current thread from cookie: {str(e)}")
                current_thread_id = None
            
        else:
            # Invalid UUID format in cookie, reset it
            current_thread_id = None
        
        if not current_thread_id:
            try:
                # Get the most recent thread for the user
                current_thread = get_latest_thread(user_email)
                logger.info(f"Latest thread for user get_latest_thread: {user_email} is {current_thread}")
                if current_thread:
                    current_thread_id = current_thread["thread_id"]
                    
            except Exception as e:
                logger.error(f"Error getting latest thread: {str(e)}")
                current_thread_id = None
        
        if not current_thread_id:   
            # clear current thread cookie
            response = JSONResponse(content={
                "has_current_thread": False,
                "thread_id": None,
                "messages": [],
                "total_messages": 0,
                "message": "No threads found. Welcome to FreddyGPT!"
            })

            # expire the cookie
            response.set_cookie(
                key="FreddyAI_CurrentThread",
                value="",
                max_age=-1,
                httponly=True,
                secure=True,
                samesite="none"
            )

            return response
        
        messages = get_thread_messages_by_thread_id(current_thread_id, user_email)
        
        logger.info(f"Found current thread {current_thread_id} with {len(messages)} messages for user: {user_email}")
        
        response = JSONResponse(content={
            "has_current_thread": True,
            "thread_id": current_thread_id,
            "thread_title": current_thread["thread_title"],
            "thread_icon": current_thread["thread_icon"],
            "messages": messages,
            "total_messages": len(messages)
        })
        
        # Set the current thread cookie (expires in 30 days)
        response.set_cookie(
            key="FreddyAI_CurrentThread",
            value=current_thread_id,
            max_age=30 * 24 * 60 * 60,  # 30 days
            httponly=True,
            secure=True,
            samesite="none"
        )
        return response

    except Exception as e:
        logger.error(f"Error getting current thread messages: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get current thread messages: {str(e)}")

@router.post("/set-current/{thread_id}")
async def set_current_thread(
    thread_id: str,
    response: Response,
    user_email: str = Depends(get_current_user_email)
):
    """
    Set the current thread by updating the FreddyAI_CurrentThread cookie
    """
    try:
        # Validate UUID format
        if not is_valid_uuid(thread_id):
            raise HTTPException(status_code=400, detail="Invalid thread ID format")
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verify the thread belongs to the user
        cursor.execute("""
            SELECT ThreadID FROM [dbo].[user_threads]
            WHERE ThreadID = ? AND UserEmail = ? AND IsActive = 1
        """, thread_id, user_email)
        
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=404, detail="Thread not found")
        
        conn.close()
        
        # Set the current thread cookie (expires in 30 days)
        response.set_cookie(
            key="FreddyAI_CurrentThread",
            value=thread_id,
            max_age=30 * 24 * 60 * 60,  # 30 days
            httponly=True,
            secure=True,
            samesite="none"
        )
        
        logger.info(f"Set current thread {thread_id} for user: {user_email}")
        
        return {
            "success": True,
            "thread_id": thread_id,
            "message": "Current thread updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting current thread: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to set current thread: {str(e)}")

@router.delete("/delete/{thread_id}")
async def deactivate_thread(
    thread_id: str,
    request: Request,
    response: JSONResponse,
    user_email: str = Depends(get_current_user_email)
):
    """
    Deactivate (soft delete) a chat thread
    """
    try:
        # Validate UUID format
        if not is_valid_uuid(thread_id):
            raise HTTPException(status_code=400, detail="Invalid thread ID format")
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verify the thread belongs to the user
        cursor.execute("""
            SELECT ThreadID FROM [dbo].[user_threads]
            WHERE ThreadID = ? AND UserEmail = ? AND IsActive = 1
        """, thread_id, user_email)
        
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=404, detail="Thread not found")
        
        # Deactivate the thread (soft delete)
        cursor.execute("""
            UPDATE [dbo].[user_threads]
            SET IsActive = 0, ModifiedDate = GETUTCDATE()
            WHERE ThreadID = ? AND UserEmail = ?
        """, thread_id, user_email)
        
        conn.commit()
        conn.close()
        
        # Clear the current thread cookie if this was the current thread
        current_thread_cookie = request.cookies.get("FreddyAI_CurrentThread")
        if current_thread_cookie == thread_id:
            response.delete_cookie(
                key="FreddyAI_CurrentThread",
                httponly=True,
                secure=True,
                samesite="none"
            )
        
        logger.info(f"Deactivated thread {thread_id} for user: {user_email}")
        
        return {
            "success": True,
            "thread_id": thread_id,
            "message": "Thread deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deactivating thread: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete thread: {str(e)}")

@router.post("/message")
async def send_chat_message(
    request: Request,
    response: Response,
    user_email: str = Depends(get_current_user_email)
):
    """
    Endpoint to send a chat message to the current thread.
    If no current thread exists, gets the latest thread or creates a new one.
    """
    datetime_now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    try:
        # Extract message content from request
        data = await request.json()
        message_content = data.get("message", "").strip()
        if not message_content:
            raise HTTPException(status_code=400, detail="Message content is required")

        # Check for current thread cookie
        current_thread_id = request.cookies.get("FreddyAI_CurrentThread")
        
        current_thread = get_thread_by_id(user_email, current_thread_id)
        if not current_thread:
            current_thread = create_thread(user_email)
            
        if not current_thread:
            raise HTTPException(status_code=500, detail="Failed to create or retrieve thread")

        current_thread_id = current_thread["thread_id"]
        
        # Save user message to thread_messages table
        user_message_id = save_user_thread_message(
            thread_id=current_thread_id,
            message_content=message_content,
        )

        if not user_message_id:
            raise HTTPException(status_code=500, detail="Failed to save user message")
        
        # load user session
        user_session = load_session(user_email)
        agent_controller = agents.agent_controller.get_agent_controller(user_session)

        def serialize_sse_event(data: Dict) -> str:
            return f"data: {json.dumps(data)}\n\n"
      
        async def response_stream() -> AsyncGenerator[str, None]:
            # Send message to agent controller and get response
            nonlocal current_thread_id
            for chunk in agent_controller.stream(
                {"messages": [{"role": "user", "content": message_content}]},
                stream_mode="updates"
            ):
                for step, data in chunk.items():
                    message = data['messages'][-1]
                    
                    if step == "model":
                        agent_code = AgentsEnum.FREDDYAI_ASSISTANT.value
                        if message.content:
                            # print(f"{agent_code}:")
                            # print(f"{message.content}")
                            # print(f"tokens: {message.usage_metadata['total_tokens']}")
                            
                            # save message and tokens to database
                            total_tokens = message.usage_metadata['total_tokens'] if 'total_tokens' in message.usage_metadata else 0
                            completion_tokens = message.usage_metadata['output_tokens'] if 'output_tokens' in message.usage_metadata else 0
                            prompt_tokens = total_tokens - completion_tokens
                                                                
                            logger.info(f"{agent_code}:")
                            logger.info(f"{message}")
                            logger.info(f"tokens: {total_tokens}")
                            
                            # save message and tokens to database
                            agent_message_id = save_agent_thread_message(
                                thread_id=current_thread_id,
                                message_content=message.content,
                                agent_code=agent_code,
                                input_tokens=prompt_tokens,
                                output_tokens=completion_tokens,
                            )
                            
                            yield serialize_sse_event({'type': "message", 'agent_code': agent_code, 'content': message.content, 'tokens': message.usage_metadata['total_tokens'], 'created_date': datetime_now})
                    else:
                        agent_code = message.name
                        # Parse the string content to extract AIMessage content
                        try:
                            # Use eval() to parse the string containing Python objects
                            # Note: This is safe here since we control the content source
                          
                            content_dict = eval(message.content, {"__builtins__": {}, "HumanMessage": HumanMessage, "AIMessage": AIMessage})
                            
                            # Extract AIMessage content from the parsed dictionary
                            if 'messages' in content_dict:
                                # Get the last message which should be the AIMessage
                                aiMessage = content_dict['messages'][-1]
                                msg = aiMessage.content
                                total_tokens = aiMessage.response_metadata['token_usage']['total_tokens'] if 'response_metadata' in dir(aiMessage) and 'token_usage' in aiMessage.response_metadata else 0
                                completion_tokens = aiMessage.response_metadata['token_usage']['completion_tokens'] if 'response_metadata' in dir(aiMessage) and 'token_usage' in aiMessage.response_metadata else 0
                                prompt_tokens = total_tokens - completion_tokens
                                
                                logger.info(f"{agent_code}:")
                                logger.info(f"{aiMessage}")
                                logger.info(f"tokens: {total_tokens}")
                                
                                # save message and tokens to database
                                save_agent_thread_message(
                                    thread_id=current_thread_id,
                                    message_content=msg,
                                    agent_code=agent_code,
                                    input_tokens=prompt_tokens,
                                    output_tokens=completion_tokens,
                                )
                                
                                yield serialize_sse_event({'type': "message", 'agent_code': agent_code, 'content': msg, 'tokens': total_tokens, 'created_date': datetime_now})
                        except Exception as e:
                            # If parsing fails, just print the raw content
                            logger.error(f"Error: {e}")
                    
            # Indicate completed message
            # completed_message = {'type': "completed_message"}
            # yield serialize_sse_event(completed_message)
            
            # Signal end of stream
            yield serialize_sse_event({'type': "stream_end"})
        
        # Set the Server-Sent Events (SSE) response headers.
        headers = {
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }

        response = StreamingResponse(response_stream(), media_type="text/event-stream", headers=headers) 
        
        # Set/update the current thread cookie
        response.set_cookie(
            key="FreddyAI_CurrentThread",
            value=current_thread_id,
            max_age=30 * 24 * 60 * 60,  # 30 days
            httponly=True,
            secure=True,
            samesite="none"
        )
        
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chat message: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process message: {e}")
    

