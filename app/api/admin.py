from fastapi import APIRouter,Depends
from typing import List

from app.utils.auth import verify_admin
from app.db.models import ToolSchema, ProtocolSchema, RoutineSchema

router = APIRouter()

crud_routes(router, "tools", ToolSchema, dependencies=[Depends(verify_admin)])
crud_routes(router, "protocols", ProtocolSchema, dependencies=[Depends(verify_admin)])
crud_routes(router, "routines", RoutineSchema, dependencies=[Depends(verify_admin)])
