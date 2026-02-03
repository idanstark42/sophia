from pydantic import BaseModel
from typing import List, Optional

class ToolSchema(BaseModel):
  name: str
  description: Optional[str]
  base_url: Optional[str]
  auth: Optional[dict]
  actions: List[dict]

class ProtocolSchema(BaseModel):
  name: str
  description: Optional[str]
  commands: List[str]

class RoutineSchema(BaseModel):
  name: str
  description: Optional[str]
  schedule: str
  protocol_ids: List[str]
