from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# from app.api.assistant import router as assistant_router
from app.api.admin import router as admin_router
# from app.api.tools import router as tools_router

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
  "http://localhost:3000",  # frontend if needed
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
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
# app.include_router(assistant_router, prefix="/assistant", tags=["Assistant"])
# app.include_router(tools_router, prefix="/tools", tags=["Tools"])

# ------------------------
# Startup / Shutdown Events
# ------------------------
@app.on_event("startup")
async def startup_event():
  print("Starting Assistant Server...")
  # Initialize MongoDB client, scheduler, or load LLM weights if needed
  # e.g., await init_db(), load_models()

@app.on_event("shutdown")
async def shutdown_event():
  print("Shutting down Assistant Server...")
  # Cleanup resources if needed
  # e.g., close DB connections
