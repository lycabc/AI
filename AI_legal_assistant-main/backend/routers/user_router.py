from fastapi import APIRouter
from fastapi import Request
from sqlalchemy.orm import Session
from fastapi import Depends
from services.user_service import UserService
from schemas.user_schema import UserRegisterRequest, UserLoginRequest
from database.db import get_db
from security.get_current_user import get_current_user

user_router = APIRouter(prefix="/user", tags=["User"])


@user_router.post("/register")
async def user_register(data: UserRegisterRequest,
                        request: Request,
                        db: Session = Depends(get_db)):
    return UserService.user_register(db, data)


@user_router.post("/login")
async def user_login(data: UserLoginRequest,
                     request: Request,
                     db: Session = Depends(get_db)):
    return UserService.user_login(db, data)


@user_router.get("/info")
async def user_info(current_user=Depends(get_current_user),
                    db: Session = Depends(get_db)):
    return UserService.user_info(db, current_user)
