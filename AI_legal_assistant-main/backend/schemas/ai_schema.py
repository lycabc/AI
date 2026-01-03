from pydantic import BaseModel
from datetime import datetime
from pydantic import Field


class AiInitModelRequest(BaseModel):
    case_type: str = Field(..., example="Personal Injury")
    case_description: str = Field(
        ..., example="Slip and fall accident in a retail store resulting in a broken leg.")
    location: str = Field(..., example="Los Angeles, California")
    prosecute_date: datetime = Field(..., example="2024-10-25T14:30:00")


class AiChatRequest(BaseModel):
    session_id: str
    case_id: str
    prompt: str


class AiLeasonInitModelRequest(BaseModel):
    leason_id: int


class AiLeasonChatRequest(BaseModel):
    session_id: str
    prompt: str


class AiLeasonQuestionRequest(BaseModel):
    leason_id: int


class AiRecommendLawyerRequest(BaseModel):
    case_id: str
