from motor.motor_asyncio import AsyncIOMotorClient
from bson.objectid import ObjectId
from typing import Optional

from app.config.config import MONGODB_URI, MONGODB_DB

# ------------------------
# MongoDB client
# ------------------------
client: Optional[AsyncIOMotorClient] = None
db = None

def init_db():
  """Initialize MongoDB client and database"""
  global client, db
  if client is None:
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DB]

# ------------------------
# Helper for ObjectId conversion
# ------------------------
def convert_id(document: dict) -> dict:
  if document and "_id" in document:
    document["id"] = str(document["_id"])
    del document["_id"]
  return document

# ------------------------
# Generic CRUD functions
# ------------------------
async def get_all(collection_name: str):
  init_db()
  cursor = db[collection_name].find()
  results = []
  async for doc in cursor:
    results.append(convert_id(doc))
  return results

async def get_one(collection_name: str, item_id: str):
  init_db()
  doc = await db[collection_name].find_one({"_id": ObjectId(item_id)})
  return convert_id(doc)

async def create(collection_name: str, data: dict):
  print('creating')
  init_db()
  print(collection_name, data)
  result = await db[collection_name].insert_one(data)
  print(result.inserted_id)
  data["id"] = str(result.inserted_id)
  print(data)
  return data

async def update(collection_name: str, item_id: str, data: dict):
  init_db()
  result = await db[collection_name].update_one({"_id": ObjectId(item_id)}, {"$set": data})
  if result.matched_count == 0:
    return None
  return await get_one(collection_name, item_id)

async def delete(collection_name: str, item_id: str):
  init_db()
  result = await db[collection_name].delete_one({"_id": ObjectId(item_id)})
  return result.deleted_count > 0

async def find(collection_name: str, query: dict, *, limit: int | None = None):
  init_db()
  cursor = db[collection_name].find(query)
  if limit:
    cursor = cursor.limit(limit)

  results = []
  async for doc in cursor:
    results.append(convert_id(doc))
  return results
