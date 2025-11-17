import fastapi
from fastapi import Request
from fastapi.responses import HTMLResponse

from routes.routes_base import templates

router = fastapi.APIRouter()

@router.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Serve the main React app for the root path"""
    template_response = templates.TemplateResponse(
        request,
        "index.html"
    )
    return template_response

@router.get("/{full_path:path}", response_class=HTMLResponse)
async def catch_all(request: Request, full_path: str):
    """
    Catch-all route to serve index.html for all non-API routes.
    This enables client-side routing for the React SPA.
    """
    # Let API routes pass through (they should be handled by other routers)
    if full_path.startswith("api/"):
        raise fastapi.HTTPException(status_code=404, detail="API endpoint not found")
    
    # Serve index.html for all other routes
    template_response = templates.TemplateResponse(
        request,
        "index.html"
    )
    return template_response