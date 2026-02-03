from app.db.crud import (
  get_all,
  get_one,
  create,
  update,
  delete,
)

def crud_routes(router, collection: str, schema, name=None, dependencies=None):
  if name == None:
    name = collection
  @router.get(f"/{name}", response_model=List[schema], dependencies=dependencies)
  async def list_items():
    return await get_all(collection)

  @router.get(f"/{name}/{{item_id}}", response_model=schema, dependencies=dependencies)
  async def read_item(item_id: str):
    item = await get_one(collection, item_id)
    if not item:
      raise HTTPException(status_code=404, detail=f"{collection[:-1].title()} not found", dependencies=dependencies)
    return item

  @router.post(f"/{name}", response_model=schema, dependencies=dependencies)
  async def create_item(item: schema):
    return await create(collection, item.dict())

  @router.put(f"/{name}/{{item_id}}", response_model=schema, dependencies=dependencies)
  async def update_item(item_id: str, item: schema):
    updated = await update(collection, item_id, item.dict())
    if not updated:
      raise HTTPException(status_code=404, detail=f"{collection[:-1].title()} not found")
    return updated

  @router.delete(f"/{name}/{{item_id}}", dependencies=dependencies)
  async def delete_item(item_id: str):
    deleted = await delete(collection, item_id)
    if not deleted:
      raise HTTPException(status_code=404, detail=f"{collection[:-1].title()} not found")
    return {"detail": f"{collection[:-1].title()} deleted"}
