from services.ai_service import AiService
from sqlalchemy.orm import Session
from fastapi import Depends, UploadFile, File, BackgroundTasks
from database.db import get_db
from security.get_current_user import get_current_user
from schemas.ai_schema import AiInitModelRequest, AiChatRequest, AiLeasonInitModelRequest, AiLeasonChatRequest, AiLeasonQuestionRequest, AiRecommendLawyerRequest
from fastapi import APIRouter, Body

ai_router = APIRouter(prefix="/ai", tags=["AI"])


@ai_router.post("/init_model")
def init_model(data: AiInitModelRequest, current_user=Depends(get_current_user), db=Depends(get_db)):
    return AiService.init_model(data, current_user, db)


@ai_router.post("/init_leason_model")
def init_leason_model(data: AiLeasonInitModelRequest, current_user=Depends(get_current_user), db=Depends(get_db)):
    return AiService.init_leason_model(data, current_user, db)


@ai_router.post("/chat")
def chat(data: AiChatRequest, current_user=Depends(get_current_user), db=Depends(get_db)):
    return AiService.chat(data, current_user, db)


@ai_router.post("/leason_chat")
def leason_chat(data: AiLeasonChatRequest, current_user=Depends(get_current_user), db=Depends(get_db)):
    return AiService.leason_chat(data, current_user, db)


@ai_router.post("/leason_question")
def leason_question(data: AiLeasonQuestionRequest, current_user=Depends(get_current_user), db=Depends(get_db)):
    return AiService.leason_question(data, current_user, db)


@ai_router.get("/case_list")
async def case_list(current_user=Depends(get_current_user),
                    db: Session = Depends(get_db)):
    return AiService.case_list(db, current_user)


@ai_router.get("/case_detail/{case_id}")
def case_detail(case_id: str, current_user=Depends(get_current_user), db=Depends(get_db)):
    return AiService.case_detail(case_id, current_user, db)


@ai_router.post("/case_delete")
def case_delete(case_id: str = Body(..., embed=True), current_user=Depends(get_current_user), db=Depends(get_db)):
    return AiService.case_delete(case_id, current_user, db)


@ai_router.post("/speech_to_text")
async def speech_to_text(file: UploadFile = File(...), current_user=Depends(get_current_user)):
    return await AiService.speech_to_text(file)


@ai_router.post("/text_to_speech")
async def text_to_speech(background_tasks: BackgroundTasks, text: str = Body(..., embed=True), current_user=Depends(get_current_user)):
    return AiService.text_to_speech(text, background_tasks)


@ai_router.post("/document_analysis")
async def document_analysis(file: UploadFile = File(...), current_user=Depends(get_current_user), db=Depends(get_db)):
    return await AiService.document_analysis(file, current_user, db)


@ai_router.post("/recommend_laywer")
def recommend_laywer(data: AiRecommendLawyerRequest, current_user=Depends(get_current_user), db=Depends(get_db)):
    return AiService.recommend_laywer(data, current_user, db)
