from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from database.db import Base
from datetime import datetime


class Laywer(Base):
    __tablename__ = "laywer"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    # 擅长领域
    expertise = Column(String(255), nullable=False)
    # 价格
    price = Column(String(255), nullable=False)
    # 评分
    rating = Column(String(255), nullable=False)
    # 介绍
    introduction = Column(Text, nullable=False)
    # 位置
    location = Column(String(255), nullable=False)
    # 律所
    law_firm = Column(String(255), nullable=False)
    # 律所地址
    firm_address = Column(String(255), nullable=False)

    def as_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email, "expertise": self.expertise, "price": self.price, "rating": self.rating, "introduction": self.introduction, "location": self.location, "law_firm": self.law_firm, "firm_address": self.firm_address}
