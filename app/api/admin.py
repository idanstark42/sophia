import os
from fastapi import APIRouter, Depends, HTTPException, status

from app.utils.auth import verify_admin
from app.data.models import ToolSchema, ProtocolSchema, RoutineSchema, SettingsSchema
from app.api.crud import crud_routes

ADMIN_API_KEY = os.getenv("ADMIN_API_KEY") or "change_this_to_real_key"
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD") or "change_this_to_real_key"

router = APIRouter()

crud_routes(router, "tools", ToolSchema)
crud_routes(router, "protocols", ProtocolSchema, dependencies=[Depends(verify_admin)])
crud_routes(router, "routines", RoutineSchema, dependencies=[Depends(verify_admin)])
crud_routes(router, "settings", SettingsSchema, dependencies=[Depends(verify_admin)])

@router.post("/login")
async def login(password: str):
  if password == ADMIN_PASSWORD:
    return { "token": ADMIN_API_KEY }
  else:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Wrong password"
    )