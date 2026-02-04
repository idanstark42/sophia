from fastapi import APIRouter,Depends
from fastapi.staticfiles import StaticFiles

router = APIRouter()

router.mount("/static", StaticFiles(directory="static"), name="static")

