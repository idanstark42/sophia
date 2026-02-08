import httpx
import asyncio
from typing import AsyncGenerator, List, Dict, Any
from datetime import datetime

from app.data import crud

OLLAMA_BASE_URL = "http://127.0.0.1:11434"
DEFAULT_MODEL = "llama2:7b"


from typing import AsyncGenerator, List, Dict, Any
from datetime import datetime
from app.data import crud

CONVERSATION_COLLECTION = "conversations"

class AssistantSession:
  def __init__(self, conversation_id: str | None = None):
    self.conversation_id = conversation_id
    self.started_at = datetime.utcnow()

  async def start(self) -> dict:
    if not self.conversation_id:
      data = {
        "started_at": self.started_at.isoformat(),
        "messages": []
      }
      saved = await crud.create(CONVERSATION_COLLECTION, data)
      self.conversation_id = saved["id"]  # MongoDB ObjectId as string

    return {
      "conversation_id": self.conversation_id,
      "started_at": self.started_at.isoformat(),
    }


  async def end(self) -> Dict[str, Any]:
    ended_at = datetime.utcnow().isoformat()
    # Update conversation with end time
    await crud.update(CONVERSATION_COLLECTION, self.conversation_id, {
      "ended_at": ended_at
    })
    return {
      "conversation_id": self.conversation_id,
      "ended_at": ended_at,
    }

  async def save_message(self, role: str, content: str):
    """Append a message to the conversation"""
    conversation = await crud.get_one(CONVERSATION_COLLECTION, self.conversation_id)
    if conversation is None:
      raise ValueError(f"Conversation {self.conversation_id} not found")
    messages = conversation.get("messages", [])
    if len(messages) > 0 and messages[-1]['role'] == role:
      messages[-1]['content'] += content
      messages[-1]['timestamp'] = datetime.utcnow().isoformat()
    else:
      messages.append({
        "role": role,
        "content": content,
        "timestamp": datetime.utcnow().isoformat()
      })
    await crud.update(CONVERSATION_COLLECTION, self.conversation_id, {"messages": messages})

  async def load_messages(self) -> List[Dict[str, Any]]:
    """Retrieve all messages for this conversation"""
    conversation = await crud.get_one(CONVERSATION_COLLECTION, self.conversation_id)
    return conversation.get("messages", []) if conversation else []

async def stream_llm(prompt: str) -> AsyncGenerator[str, None]:
  async with httpx.AsyncClient(timeout=None) as client:
    async with client.stream(
      "POST",
      f"{OLLAMA_BASE_URL}/api/generate",
      json={
        "model": DEFAULT_MODEL,
        "prompt": prompt,
        "stream": True,
      },
    ) as response:
      response.raise_for_status()
      async for line in response.aiter_lines():
        if not line:
          continue
        data = httpx.Response(200, content=line).json()
        if "response" in data:
          yield data["response"]
        if data.get("done"):
          break

async def stream_llm_with_context(conversation_id: str, user_input: str) -> AsyncGenerator[str, None]:
  messages = await AssistantSession(conversation_id).load_messages()
  
  # Format the conversation
  formatted = ""
  for m in messages:
    formatted += f"{m['role']}: {m['content']}\n"
  formatted += f"user: {user_input}\nassistant:"

  async with httpx.AsyncClient(timeout=None) as client:
    async with client.stream(
      "POST",
      f"{OLLAMA_BASE_URL}/api/generate",
      json={
        "model": DEFAULT_MODEL,
        "prompt": formatted,
        "stream": True,
      },
    ) as response:
      response.raise_for_status()
      async for line in response.aiter_lines():
        if not line:
          continue
        data = httpx.Response(200, content=line).json()
        if "response" in data:
          yield data["response"]
        if data.get("done"):
          break

async def run_protocol(protocol_name: str) -> AsyncGenerator[str, None]:
  results = await crud.find("protocols", { "name": protocol_name }, limit = 2)

  if not results:
    yield f"[ERROR] Protocol '{protocol_name}' not found.\n"
    return

  if len(results) > 1:
    yield f"[ERROR] Multiple protocols named '{protocol_name}'.\n"
    return

  protocol = results[0]
  commands: List[str] = protocol.get("commands", [])

  yield f"[PROTOCOL START] {protocol_name}\n"

  for idx, command in enumerate(commands, start=1):
    yield f"\n[STEP {idx}] {command}\n"
    async for token in stream_llm(command):
      yield token
    await asyncio.sleep(0.2)

  yield f"\n[PROTOCOL END] {protocol_name}\n"
