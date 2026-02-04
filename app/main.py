import os
from dotenv import load_dotenv
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.routing import APIRoute

from app.api.static import router as static_router
# from app.api.assistant import router as assistant_router
from app.api.admin import router as admin_router
# from app.api.tools import router as tools_router

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(BASE_DIR, "config", "secrets.env")

load_dotenv(dotenv_path=env_path)

app = FastAPI(
  title="Sophia",
  description="The Sophia server",
  version="0.1.0"
)

# ------------------------
# Middleware (CORS example)
# ------------------------
origins = [
  "http://localhost",
  "http://localhost:5173",  # dev frontend
  "http://localhost:3000",
]
app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# ------------------------
# Include Routers
# ------------------------
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
# app.include_router(assistant_router, prefix="/assistant", tags=["Assistant"])
# app.include_router(tools_router, prefix="/tools", tags=["Tools"])

def start():
  """Launched with `poetry run start` at root level"""
  uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
