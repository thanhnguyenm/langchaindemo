"""
Authentication routes for FreddyAI application.
Handles user login, logout, and JWT token management.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
import pyodbc
import hashlib
import jwt
import os
from dotenv import load_dotenv
from utils.database import get_db_connection
from utils.logging_setup import logger
load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["authentication"])

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
COOKIE_NAME = "FreddyAI_Auth"
COOKIE_DOMAIN = None  # Set to your domain in production
COOKIE_SECURE = True  # Set to True in production with HTTPS
COOKIE_SAMESITE = "none"  # Changed to "none" for cross-origin requests

# Security scheme for JWT
security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token from Authorization header"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return email
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        logger.warning("Could not validate credentials")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Unexpected error during token verification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def verify_token_from_cookie(request: Request):
    """Verify JWT token from cookie"""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authentication token found in cookie",
        )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

def get_current_user(request: Request, response: Response = None):
    """Get current user from cookie or Authorization header and refresh cookie if needed"""
    current_user_email = None
    
    # First try to get token from cookie
    try:
        current_user_email = verify_token_from_cookie(request)
        
        # If we have a response object and successfully verified from cookie, refresh the cookie
        if response and current_user_email:
            refresh_auth_cookie(response, current_user_email)
            
        return current_user_email
    except HTTPException:
        # If cookie authentication fails, try Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                email: str = payload.get("sub")
                if email:
                    # If we have a response object, set a new cookie for header-authenticated user
                    if response:
                        refresh_auth_cookie(response, email)
                    return email
            except (jwt.ExpiredSignatureError, jwt.JWTError):
                pass
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

def refresh_auth_cookie(response: Response, email: str):
    """Refresh the authentication cookie with a new token and extended expiration"""
    try:
        # Create a new access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": email}, 
            expires_delta=access_token_expires
        )
        
        # Set the refreshed HTTP-only cookie
        response.set_cookie(
            key=COOKIE_NAME,
            value=access_token,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert minutes to seconds
            path="/",
            domain=COOKIE_DOMAIN,
            secure=COOKIE_SECURE,
            httponly=True,  # Prevents JavaScript access to the cookie
            samesite=COOKIE_SAMESITE
        )
        
        logger.info(f"Authentication cookie refreshed for user: {email}")
        
    except Exception as e:
        # Log error but don't fail the request for cookie refresh issues
        logger.error(f"Error refreshing authentication cookie for {email}: {str(e)}")

def get_user_from_db(email: str):
    """Get user from database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT email, password_hash, created_date, modified_date, last_login_date
            FROM users 
            WHERE email = ?
        """, (email,))
        
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return {
                "email": user[0],
                "password_hash": user[1],
                "created_date": user[2],
                "modified_date": user[3],
                "last_login_date": user[4]
            }
        return None
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

def update_last_login(email: str):
    """Update user's last login timestamp"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE users 
            SET last_login_date = GETDATE()
            WHERE email = ?
        """, (email,))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        # Log error but don't fail login for this
        print(f"Error updating last login: {str(e)}")

# Pydantic models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class LogoutResponse(BaseModel):
    message: str

class UserResponse(BaseModel):
    email: str
    created_date: datetime
    last_login_date: Optional[datetime]

# API Routes
@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, response: Response):
    """
    Authenticate user and return JWT token
    Also sets the JWT token in an HTTP-only cookie
    """
    try:
        # Get user from database
        user = get_user_from_db(login_data.email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        hashed_input_password = hash_password(login_data.password)
        if hashed_input_password != user["password_hash"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Update last login timestamp
        update_last_login(login_data.email)
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"]}, 
            expires_delta=access_token_expires
        )
        
        # Set HTTP-only cookie with the JWT token
        response.set_cookie(
            key=COOKIE_NAME,
            value=access_token,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert minutes to seconds
            path="/",
            domain=COOKIE_DOMAIN,
            secure=COOKIE_SECURE,
            httponly=True,  # Prevents JavaScript access to the cookie
            samesite=COOKIE_SAMESITE
        )
        
        # Return token and user info
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "email": user["email"],
                "created_date": user["created_date"],
                "last_login_date": datetime.utcnow()  # Current login
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login for {login_data.email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

def get_current_user_for_logout(request: Request):
    """Dependency function to get current user for logout (no cookie refresh)"""
    return get_current_user(request)

@router.post("/logout", response_model=LogoutResponse)
async def logout(request: Request, response: Response, current_user: str = Depends(get_current_user_for_logout)):
    """
    Logout user and clear the authentication cookie
    """
    try:
        # Clear the authentication cookie
        response.delete_cookie(
            key=COOKIE_NAME,
            path="/",
            domain=COOKIE_DOMAIN,
            secure=COOKIE_SECURE,
            httponly=True,
            samesite=COOKIE_SAMESITE
        )
        
        return {
            "message": f"User {current_user} logged out successfully"
        }
    except Exception as e:
        logger.error(f"Error during logout for {current_user}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )

def get_current_user_with_refresh(request: Request, response: Response):
    """Dependency function to get current user and refresh cookie"""
    return get_current_user(request, response)

def get_current_user_email(request: Request):
    """Dependency function to get current user email from cookie (no refresh)"""
    return verify_token_from_cookie(request)

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(response: Response, current_user: str = Depends(get_current_user_with_refresh)):
    """
    Get current user information from JWT token (cookie or Authorization header)
    Automatically refreshes authentication cookie on successful request
    """
    try:
        user = get_user_from_db(current_user)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "email": user["email"],
            "created_date": user["created_date"],
            "last_login_date": user["last_login_date"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user info: {str(e)}"
        )

@router.get("/verify", response_model=dict)
async def verify_token_endpoint(response: Response, current_user: str = Depends(get_current_user_with_refresh)):
    """
    Verify if the current token is valid (from cookie or Authorization header)
    Automatically refreshes authentication cookie on successful request
    """
    return {
        "valid": True,
        "user": current_user,
        "message": "Token is valid"
    }

@router.post("/refresh")
async def refresh_session(response: Response, current_user: str = Depends(get_current_user_with_refresh)):
    """
    Refresh the current session and extend cookie expiration
    This endpoint can be called periodically to keep the user session active
    """
    return {
        "message": f"Session refreshed for user {current_user}",
        "expires_in_minutes": ACCESS_TOKEN_EXPIRE_MINUTES
    }

@router.get("/status")
async def check_auth_status(request: Request, response: Response):
    """
    Check authentication status without throwing errors
    Returns authentication status and user info if available
    Automatically refreshes authentication cookie if user is authenticated
    """
    try:
        current_user = get_current_user(request, response)
        user = get_user_from_db(current_user)
        
        return {
            "authenticated": True,
            "user": {
                "email": user["email"],
                "created_date": user["created_date"],
                "last_login_date": user["last_login_date"]
            } if user else None
        }
    except:
        return {
            "authenticated": False,
            "user": None
        }
