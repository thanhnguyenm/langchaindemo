import os
import fastapi
from fastapi import Request, Response, Depends, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.templating import Jinja2Templates

from utils.logging_setup import logger


# get root folder
root_directory = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
#combine root directory with 'public' folder
#public_directory = os.path.join(root_directory, "public")
templates = Jinja2Templates(directory=root_directory)
router = fastapi.APIRouter()

