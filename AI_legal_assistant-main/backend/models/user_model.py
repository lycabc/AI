from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database.db import Base
from enum import Enum
from sqlalchemy import Enum as SQLAlchemyEnum


class UserType(str, Enum):
    VISITOR = "visitor"
    SUBSCRIBER = "subscriber"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=True)
    password = Column(String(100), nullable=False)
    username = Column(String(50), nullable=True)
    user_type = Column(SQLAlchemyEnum(UserType),
                       nullable=False,
                       default=UserType.VISITOR)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def as_dict(self):
        return {
            "email": self.email,
            "username": self.username,
            "user_type": self.user_type,
        }
