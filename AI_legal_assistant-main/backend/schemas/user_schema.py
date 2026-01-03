from pydantic import BaseModel, Field


class UserRegisterRequest(BaseModel):
    email: str
    password: str
    username: str


class UserLoginRequest(BaseModel):
    email: str = Field(..., example="706420258@qq.com")
    password: str = Field(..., example="shihaotian622")
