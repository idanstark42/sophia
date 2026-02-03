import os
from fastapi import Header, HTTPException, status

ADMIN_API_KEY = os.getenv("ADMIN_API_KEY") or "change_this_to_real_key"

async def verify_admin(x_api_key: str = Header(...)):
  if x_api_key != ADMIN_API_KEY:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid API Key"
    )
