from pydantic import BaseModel
from typing import List, Optional, Dict

class Describable(BaseModel):
  id: Optional[str] = None
  name: str
  description: Optional[str]

class ToolSchema(Describable):
  base_url: Optional[str]
  auth: Optional[Dict]
  actions: List[Dict]

class ProtocolSchema(Describable):
  commands: List[str]

class RoutineSchema(Describable):
  schedule: str
  protocol_ids: List[str]

class SettingsSchema(Describable):
  settings: Dict
