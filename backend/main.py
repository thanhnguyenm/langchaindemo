import os
import contextlib
import fastapi
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse

from utils.logging_setup import logger
from routes.routes_views import router as routes_views
from routes.routes_authentication import router as routes_authentication
from routes.routes_agents import router as routes_agents
from routes.routes_user import router as routes_user
from routes.routes_threads import router as routes_threads
from middleware.auth_middleware import AuthCookieMiddleware

@contextlib.asynccontextmanager
async def lifespan(app: fastapi.FastAPI):
    db = None
    
    try:
        
        
        yield
        
    except Exception as e:
        logger.error(f"Error during app startup: {e}")
        raise RuntimeError("Failed to start application") from e
      
    finally:
        db = None
        
def create_app():
  
    app = fastapi.FastAPI(lifespan=lifespan)
    
    directory = os.path.join(os.path.dirname(__file__), "assets")
    app.state.agent = None
    app.mount("/assets", StaticFiles(directory=directory), name="assets")

    # Include API routes first (they have higher priority)
    app.include_router(routes_authentication)
    app.include_router(routes_agents)
    app.include_router(routes_user)
    app.include_router(routes_threads)
    
    # Include view routes last (includes catch-all route)
    app.include_router(routes_views)
    
    # Add authentication middleware - this will check and refresh cookies for all requests
    app.add_middleware(
        AuthCookieMiddleware,
        excluded_paths=[
            "/api/auth/login",
            "/api/auth/logout", 
            "/api/auth/status",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/assets",
            "/"
        ]
    )
      
    # config CORS    
    origins = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # React dev server
        "http://127.0.0.1:8000"
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Global exception handler for any unhandled exceptions
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error("Unhandled exception occurred", exc_info=exc)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )
    
    return app