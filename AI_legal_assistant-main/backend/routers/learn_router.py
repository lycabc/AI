from fastapi import APIRouter, Query
from sqlalchemy.orm import Session
from fastapi import Depends
from typing import Optional
from security.get_current_user import get_current_user
from database.db import get_db
from services.learn_service import LearnService

learn_router = APIRouter(prefix="/learn", tags=["Learn"])


@learn_router.get("/leason_list")
async def leason_list(
    page: int = Query(1, description="Page number"),
    limit: int = Query(10, description="Items per page"),
    leason_type: Optional[str] = Query(None, description="Lesson type filter"),
    search_text: Optional[str] = Query(None, description="Search text"),
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    return LearnService.leason_list(page, limit, leason_type, search_text, current_user, db)
