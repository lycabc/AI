from google.genai import types  # 确保导入了 types
from utils.generate_prompt import generate_prompt, generate_leason_prompt, generate_leason_question_prompt, generate_recommend_laywer_prompt
import uuid
from services.redis_service import RedisService
from models.case_model import Case
from fastapi.responses import JSONResponse
from utils.ai_util import get_ai_response, ai_speech_to_text, ai_text_to_speech, ai_document_analysis
from schemas.ai_schema import AiChatRequest, AiInitModelRequest, AiLeasonInitModelRequest, AiLeasonChatRequest, AiLeasonQuestionRequest, AiRecommendLawyerRequest
import json
from fastapi import UploadFile
from sqlalchemy.orm import Session
from fastapi import BackgroundTasks
import os
from fastapi.responses import FileResponse
from utils.pdf_util import extract_text_from_pdf
from models.leason_model import Leason
from models.laywer_model import Laywer


class AiService:
    @staticmethod
    def init_model(data: AiInitModelRequest, current_user, db):
        session_id = str(uuid.uuid4())
        # 生成系统指令（System Prompt）
        system_prompt = generate_prompt(
            data.case_type, data.case_description, data.location, data.prosecute_date)

        # 1. 初始化消息历史为空列表
        # 我们不再把系统指令塞进 messages 数组，而是单独存储
        init_messages = []

        # 将 system_prompt 和 messages 分别存入 Redis
        # 或者存成一个字典：{"system": system_prompt, "history": []}
        RedisService.set(f"session:{session_id}", {
            "system": system_prompt,
            "history": init_messages
        })

        case = Case(user_id=current_user["user_id"],
                    case_type=data.case_type,
                    case_description=data.case_description,
                    location=data.location,
                    prosecute_date=data.prosecute_date,
                    )
        db.add(case)
        db.commit()
        db.refresh(case)
        return JSONResponse({"session_id": session_id, "case_id": case.id})

    @staticmethod
    def init_leason_model(data: AiLeasonInitModelRequest, current_user, db):
        leason = db.query(Leason).filter(Leason.id == data.leason_id).first()
        session_id = str(uuid.uuid4())
        # 生成系统指令（System Prompt）
        system_prompt = generate_leason_prompt(
            leason.title, leason.leason_description, leason.leason_type, leason.leason_summary)

        # 1. 初始化消息历史为空列表
        # 我们不再把系统指令塞进 messages 数组，而是单独存储
        init_messages = []

        # 将 system_prompt 和 messages 分别存入 Redis
        # 或者存成一个字典：{"system": system_prompt, "history": []}
        RedisService.set(f"session:{session_id}", {
            "system": system_prompt,
            "history": init_messages
        })
        return JSONResponse({"session_id": session_id})

    @staticmethod
    def chat(data: AiChatRequest, current_user, db):
        # 2. 从 Redis 获取上下文数据
        context = RedisService.get(f"session:{data.session_id}")
        system_instruction = context.get("system")
        history = context.get("history")

        # 3. 构造当前用户的新消息（注意必须是 parts 列表格式）
        new_user_message = {
            "role": "user",
            "parts": [{"text": data.prompt}]
        }
        history.append(new_user_message)

        # 4. 调用 API，传入 system_instruction 和 history
        # 这里的 get_ai_response 需要修改以接收 history 和 system_instruction
        result_text = get_ai_response(history, system_instruction)

        # 5. 将 AI 的回复存入历史（同样使用新格式）
        history.append({
            "role": "model",
            "parts": [{"text": result_text}]
        })

        # 6. 更新 Redis 和 数据库
        RedisService.set(f"session:{data.session_id}", {
            "system": system_instruction,
            "history": history
        })
        case = db.query(Case).filter(
            Case.user_id == current_user["user_id"],
            Case.id == data.case_id
        ).first()
        case.history_conversation = json.dumps(history)
        db.commit()

        return JSONResponse({"message": result_text})

    @staticmethod
    def leason_chat(data: AiLeasonChatRequest, current_user, db):
        # 2. 从 Redis 获取上下文数据
        context = RedisService.get(f"session:{data.session_id}")
        system_instruction = context.get("system")
        history = context.get("history")

        # 3. 构造当前用户的新消息（注意必须是 parts 列表格式）
        new_user_message = {
            "role": "user",
            "parts": [{"text": data.prompt}]
        }
        history.append(new_user_message)

        # 4. 调用 API，传入 system_instruction 和 history
        # 这里的 get_ai_response 需要修改以接收 history 和 system_instruction
        result_text = get_ai_response(history, system_instruction)

        # 5. 将 AI 的回复存入历史（同样使用新格式）
        history.append({
            "role": "model",
            "parts": [{"text": result_text}]
        })

        # 6. 更新 Redis 和 数据库
        RedisService.set(f"session:{data.session_id}", {
            "system": system_instruction,
            "history": history
        })
        return JSONResponse({"message": result_text})

    @staticmethod
    def leason_question(data: AiLeasonQuestionRequest, current_user, db):
        leason = db.query(Leason).filter(Leason.id == data.leason_id).first()
        system_prompt = generate_leason_question_prompt(
            leason.title, leason.leason_description, leason.leason_type, leason.leason_summary)

        # 对话必须以 user 角色开始，system 指令应通过 system_instruction 参数传递
        init_messages = [{
            "role": "user",
            "parts": [{"text": "Please generate the quiz questions based on the lesson content."}]
        }]
        result_text = get_ai_response(init_messages, system_prompt)

        # 处理返回的字符串，提取并解析 JSON
        try:
            clean_text = result_text
            if "```json" in result_text:
                clean_text = result_text.split(
                    "```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                clean_text = result_text.split(
                    "```")[1].split("```")[0].strip()

            questions = json.loads(clean_text)
            return JSONResponse({"questions": questions})
        except Exception as e:
            print(f"JSON Parse Error: {e}, Content: {result_text}")
            return JSONResponse({"message": result_text, "error": "JSON parse failed"})

    @staticmethod
    def case_list(db: Session, current_user):
        cases = db.query(Case).filter(
            Case.user_id == current_user["user_id"]).order_by(Case.created_at.desc()).all()
        return [case.as_dict() for case in cases]

    @staticmethod
    def case_delete(case_id: str, current_user, db):
        case = db.query(Case).filter(
            Case.user_id == current_user["user_id"], Case.id == case_id).first()
        db.delete(case)
        db.commit()
        return JSONResponse({"message": "OK"})

    @staticmethod
    def case_detail(case_id: str, current_user, db):
        case = db.query(Case).filter(
            Case.user_id == current_user["user_id"], Case.id == case_id).first()
        return case.as_dict_detail()

    @staticmethod
    async def speech_to_text(file: UploadFile):
        # Whisper requires a filename to identify the format
        text = ai_speech_to_text(file.file)
        return JSONResponse({"text": text})

    @staticmethod
    def text_to_speech(text: str, background_tasks: BackgroundTasks):
        audio_file_path = ai_text_to_speech(text)

        if not audio_file_path or not os.path.exists(audio_file_path):
            return {"error": "Failed to generate audio"}
        background_tasks.add_task(os.remove, audio_file_path)
        # 2. 返回 FileResponse，并指定媒体类型为 audio/wav
        return FileResponse(
            path=audio_file_path,
            media_type="audio/wav",
            filename="legal_assistant_reply.wav"
        )

    @staticmethod
    async def document_analysis(file: UploadFile, current_user, db):
        # 保存file到本地
        file_path = f"pdfFiles/{file.filename}.pdf"
        with open(file_path, "wb") as f:
            f.write(file.file.read())
        text = extract_text_from_pdf(file_path)
        response = ai_document_analysis(text)
        os.remove(file_path)
        return JSONResponse({"text": response})

    @staticmethod
    def recommend_laywer(data: AiRecommendLawyerRequest, current_user, db):
        case = db.query(Case).filter(
            Case.user_id == current_user["user_id"], Case.id == data.case_id).first()
        if not case:
            return JSONResponse({"error": "Case not found"}, status_code=404)

        history = case.history_conversation
        lawyers = db.query(Laywer).all()
        lawyers = [lawyer.as_dict() for lawyer in lawyers]
        system_prompt = generate_recommend_laywer_prompt(
            lawyers, history, case.case_type, case.case_description, case.location, case.prosecute_date)
        init_messages = [
            {
                "role": "user",
                "parts": [
                        {"text": "Based on the lawyer database and case details provided in the system instructions, please identify and return the best matching lawyer in the required JSON format."}
                ]
            }
        ]
        result_text = get_ai_response(init_messages, system_prompt)

        # 清理并解析 JSON 结果
        try:
            cleaned_text = result_text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[len("```json"):].strip()
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3].strip()
            if cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:].strip()

            parsed_data = json.loads(cleaned_text)
            lawyer_id = parsed_data.get("id")

            if not lawyer_id:
                return JSONResponse({"error": "AI failed to return a valid lawyer ID", "raw_response": result_text}, status_code=500)

            lawyer_obj = db.query(Laywer).filter(
                Laywer.id == lawyer_id).first()
            if not lawyer_obj:
                return JSONResponse({"error": f"Lawyer with ID {lawyer_id} not found in database"}, status_code=404)

            return JSONResponse({"lawyer": lawyer_obj.as_dict()})
        except Exception as e:
            print(f"Failed to parse lawyer recommendation JSON: {e}")
            return JSONResponse({
                "error": "Failed to parse AI response",
                "raw_response": result_text
            }, status_code=500)
