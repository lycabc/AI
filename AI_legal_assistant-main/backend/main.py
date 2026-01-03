import uvicorn
import dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from middleware.jwt_auth import JWTAuthMiddleware
from database.db import engine, Base
from routers.user_router import user_router
from routers.ai_router import ai_router
from routers.learn_router import learn_router
dotenv.load_dotenv(override=True)


Base.metadata.create_all(bind=engine)
app = FastAPI()
app.add_middleware(JWTAuthMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(ai_router)
app.include_router(learn_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
