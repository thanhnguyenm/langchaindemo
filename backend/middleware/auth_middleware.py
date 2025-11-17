"""
Authentication middleware for FreddyAI application.
Automatically checks and refreshes authentication cookies for all requests.
"""

from fastapi import HTTPException, Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response as StarletteResponse
import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from utils.logging_setup import logger

load_dotenv()

# JWT Configuration (must match routes_authentication.py)
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
COOKIE_NAME = "FreddyAI_Auth"
COOKIE_DOMAIN = None  # Set to your domain in production
COOKIE_SECURE = True  # Set to True in production with HTTPS
COOKIE_SAMESITE = "none"  # Changed to "none" for cross-origin requests

class AuthCookieMiddleware(BaseHTTPMiddleware):
    """
    Middleware to automatically check and refresh authentication cookies.
    
    For every request:
    1. Check if auth cookie exists
    2. Validate the JWT token in the cookie
    3. If valid and close to expiry, refresh the cookie
    4. Continue with the request
    """
    
    def __init__(self, app, excluded_paths: list = None):
        super().__init__(app)
        # Paths that don't need authentication checking
        self.excluded_paths = excluded_paths or [
            "/api/auth/login",
            "/api/auth/logout", 
            "/api/auth/status",
            "/api/auth/me",
            "/api/auth/verify", 
            "/api/auth/refresh",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/assets",
            "/favicon.ico"
        ]
    
    async def dispatch(self, request: Request, call_next):
        """Process each request through the authentication middleware"""
        
        # Skip authentication check for excluded paths
        if any(request.url.path.startswith(path) for path in self.excluded_paths):
            return await call_next(request)
        
        # Get the auth cookie
        auth_token = request.cookies.get(COOKIE_NAME)
        
        if auth_token:
            try:
                # Validate and check if token needs refresh
                refreshed_token = self.check_and_refresh_token(auth_token)
                
                # Continue with the request
                response = await call_next(request)
                
                # If token was refreshed, update the cookie in response
                if refreshed_token and refreshed_token != auth_token:
                    self.set_auth_cookie(response, refreshed_token)
                    logger.info("Authentication cookie refreshed via middleware")
                
                return response
                
            except jwt.ExpiredSignatureError:
                logger.warning("Expired JWT token found in cookie")
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Authentication token expired"}
                )
                
            except jwt.InvalidTokenError as e:
                logger.warning(f"Invalid JWT token in cookie: {str(e)}")
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Invalid authentication token"}
                )
                
            except Exception as e:
                logger.error(f"Error in auth middleware: {str(e)}")
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Authentication error"}
                )
        else:
            # Return 401 if no auth cookie found
            logger.warning("No authentication cookie found")
            return JSONResponse(
                status_code=401,
                content={"detail": "Authentication cookie not found"}
            )
    
    def check_and_refresh_token(self, token: str) -> str:
        """
        Check if token is valid and refresh if close to expiry.
        
        Args:
            token: JWT token string
            
        Returns:
            str: Original token or new refreshed token
        """
        try:
            # Decode the token to check its claims
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            
            # Get token expiration time
            exp_timestamp = payload.get("exp")
            if not exp_timestamp:
                return token
            
            exp_datetime = datetime.fromtimestamp(exp_timestamp)
            current_time = datetime.utcnow()
            
            # Calculate time until expiration
            time_until_expiry = exp_datetime - current_time
            
            # If token expires in less than 10 minutes, refresh it
            if time_until_expiry.total_seconds() < 600:  # 10 minutes
                logger.info("Token close to expiry, refreshing...")
                return self.create_new_token(payload.get("sub"))
            
            return token
            
        except jwt.ExpiredSignatureError:
            # Token already expired
            raise
        except jwt.InvalidTokenError:
            # Invalid token
            raise
    
    def create_new_token(self, email: str) -> str:
        """
        Create a new JWT token for the user.
        
        Args:
            email: User email address
            
        Returns:
            str: New JWT token
        """
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode = {"sub": email, "exp": expire}
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def set_auth_cookie(self, response: StarletteResponse, token: str):
        """
        Set the authentication cookie in the response.
        
        Args:
            response: HTTP response object
            token: JWT token to set in cookie
        """
        response.set_cookie(
            key=COOKIE_NAME,
            value=token,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert minutes to seconds
            path="/",
            domain=COOKIE_DOMAIN,
            secure=COOKIE_SECURE,
            httponly=True,  # Prevents JavaScript access to the cookie
            samesite=COOKIE_SAMESITE
        )
    
    def clear_auth_cookie(self, response: StarletteResponse):
        """
        Clear the authentication cookie from the response.
        
        Args:
            response: HTTP response object
        """
        response.delete_cookie(
            key=COOKIE_NAME,
            path="/",
            domain=COOKIE_DOMAIN
        )