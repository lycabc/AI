import time

from fastapi import Request
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from starlette.middleware.base import BaseHTTPMiddleware
import os
import dotenv
dotenv.load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


class JWTAuthMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        EXCLUDE_PATHS = [
            "",
            "/",
            "/_ah/warmup",
            "/auth/login",
            "/docs",
            "/openapi.json",
            "/redoc",
            "/favicon.ico",
            "/user/register",
            "/user/login",
        ]

        # 忽略无需鉴权的路径
        if path in EXCLUDE_PATHS:
            return await call_next(request)

        # 解析 Authorization 头
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                request.state.user = payload.get("user_id")
                request.state.user_type = payload.get(
                    "user_type"
                )  # 使用 user_type 字段
                # 检查token是否过期
                if payload.get("exp") < time.time():
                    return JSONResponse(
                        status_code=401, content={"detail": "Token has expired"}
                    )
            except JWTError as e:
                print(f"DEBUG: Middleware JWTError: {e}")
                if isinstance(e, jwt.ExpiredSignatureError):
                    return JSONResponse(
                        status_code=401, content={"detail": "Token has expired"}
                    )
                else:
                    return JSONResponse(
                        status_code=401, content={"detail": "Invalid token"}
                    )
        else:
            return JSONResponse(
                status_code=401, content={"detail": "Authorization header missing"}
            )

        return await call_next(request)
