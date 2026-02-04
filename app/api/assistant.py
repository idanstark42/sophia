from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

from app.core.assistant import AssistantSession, stream_llm_with_context

router = APIRouter()

class ConversationRequest(BaseModel):
  prompt: str
  conversation_id: Optional[str] = None  # Optional for continuing conversation

class ProtocolRequest(BaseModel):
  protocol_name: str

@router.post("/conversation/stream")
async def conversation_stream(req: ConversationRequest):
  session = AssistantSession(conversation_id=req.conversation_id)
  meta = await session.start()  # create new or continue existing

  async def event_stream():
    # Only send start message if this is a new conversation
    if not req.conversation_id:
      yield f"[CONVERSATION START {meta['conversation_id']}]\n"
      await session.save_message("system", f"Conversation started at {meta['started_at']}")

    # Save the user message
    await session.save_message("user", req.prompt)

    # Stream LLM response using full conversation context
    async for token in stream_llm_with_context(meta["conversation_id"], req.prompt):
      yield token
      await session.save_message("assistant", token)

  return StreamingResponse(event_stream(), media_type="text/plain")

@router.post("/protocol/run")
async def protocol_run(req: ProtocolRequest):
  session = AssistantSession()
  meta = await session.start()  # now async

  async def event_stream():
    yield f"[CONVERSATION START {meta['conversation_id']}]\n"
    await session.save_message("system", f"Protocol run started at {meta['started_at']}")
    await session.save_message("system", f"Running protocol: {req.protocol_name}")

    async for token in run_protocol(req.protocol_name):
      yield token
      await session.save_message("assistant", token)

    end_meta = await session.end()
    await session.save_message("system", f"Protocol run ended at {end_meta['ended_at']}")
    yield f"\n[CONVERSATION END {end_meta['conversation_id']}]\n"

  return StreamingResponse(event_stream(), media_type="text/plain")
