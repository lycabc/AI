from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from database.db import Base
from enum import Enum
from sqlalchemy import Enum as SQLAlchemyEnum
import uuid
import json


class CaseStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Case(Base):
    __tablename__ = "cases"
    id = Column(String(36), primary_key=True, index=True,
                default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    case_type = Column(String(100), nullable=False)
    status = Column(SQLAlchemyEnum(CaseStatus),
                    nullable=False,
                    default=CaseStatus.PENDING)
    case_description = Column(Text, nullable=False)
    location = Column(String(100), nullable=True)
    prosecute_date = Column(DateTime, nullable=True)
    history_conversation = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def as_dict(self):
        return {
            "id": self.id,
            "case_type": self.case_type,
            "status": self.status,
            "case_description": self.case_description,
            "location": self.location,
            "prosecute_date": self.prosecute_date,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    def as_dict_detail(self):
        return {
            "id": self.id,
            "case_type": self.case_type,
            "status": self.status,
            "case_description": self.case_description,
            "location": self.location,
            "prosecute_date": self.prosecute_date,
            "history_conversation": json.loads(self.history_conversation),
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
