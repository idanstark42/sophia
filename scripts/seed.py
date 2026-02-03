# seed.py
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from app.config.config import MONGODB_URI, MONGODB_DB

# ------------------------
# Required collections
# ------------------------
REQUIRED_COLLECTIONS = ["tools", "protocols", "routines", "conversations", "logs"]

async def seed_db():
  client = AsyncIOMotorClient(MONGODB_URI)
  db = client[MONGODB_DB]

  # List existing collections
  existing_collections = await db.list_collection_names()

  if all(col in existing_collections for col in REQUIRED_COLLECTIONS):
    print("Database already exists with all required collections. Nothing to do.")
    return

  # Create missing collections
  for col in REQUIRED_COLLECTIONS:
    if col not in existing_collections:
      await db.create_collection(col)
      print(f"Created collection: {col}")

  print("Database seeding complete.")
  await client.close()

if __name__ == "__main__":
  asyncio.run(seed_db())
