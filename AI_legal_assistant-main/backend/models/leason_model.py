from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from database.db import Base
from datetime import datetime


class Leason(Base):
    __tablename__ = "leason"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    video_url = Column(String(255), nullable=False)
    leason_type = Column(String(255), nullable=False)
    leason_description = Column(Text, nullable=True)
    leason_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    def as_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "video_url": self.video_url,
            "leason_type": self.leason_type,
            "leason_description": self.leason_description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    def as_dict_detail(self):
        return {
            "id": self.id,
            "title": self.title,
            "video_url": self.video_url,
            "leason_type": self.leason_type,
            "leason_description": self.leason_description,
            "leason_summary": self.leason_summary,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
