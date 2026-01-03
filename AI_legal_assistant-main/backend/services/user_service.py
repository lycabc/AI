from sqlalchemy.orm import Session
from schemas.user_schema import UserRegisterRequest, UserLoginRequest
from models.user_model import User
from passlib.context import CryptContext
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from utils.encrypt_util import hash_password, check_password
from security.jwt import generate_token
from security.get_current_user import get_current_user
from fastapi import Depends


class UserService:
    @staticmethod
    def user_register(db: Session, data: UserRegisterRequest):
        # 检查邮箱是否已存在
        user = db.query(User).filter(User.email == data.email).first()
        if user:
            raise HTTPException(status_code=400, detail="Email already exists")
        # 创建新用户
        user = User(email=data.email, password=hash_password(data.password),
                    username=data.username)
        db.add(user)
        db.commit()
        token = generate_token(
            {"user_id": user.id}
        )
        return JSONResponse(status_code=200, content={"message": "OK", "token": token})

    @staticmethod
    def user_login(db: Session, data: UserLoginRequest):
        user = db.query(User).filter(User.email == data.email).first()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        if not check_password(user.password, data.password):
            raise HTTPException(status_code=400, detail="Incorrect password")
        token = generate_token(
            {"user_id": user.id}
        )
        return JSONResponse(status_code=200, content={"message": "OK", "token": token})

    @staticmethod
    def user_info(db: Session, current_user):
        user = db.query(User).filter(
            User.id == current_user["user_id"]).first()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        return user.as_dict()
