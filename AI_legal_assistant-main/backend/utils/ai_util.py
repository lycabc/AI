import wave
import os
from google import genai
from google.genai import types
import uuid
import json

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def get_ai_response(history, system_instruction=None):
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=history,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction
        )
    )
    return response.text


def ai_speech_to_text(file_obj):
    """
    Transcribe audio using Gemini's native multimodal processing
    """
    try:
        # Reset file pointer to beginning
        file_obj.seek(0)
        audio_data = file_obj.read()

        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=[
                "Please transcribe this audio into text accurately.",
                types.Part.from_bytes(
                    data=audio_data,
                    mime_type="audio/mpeg"  # Or audio/wav, audio/x-m4a
                )
            ]
        )
        return response.text
    except Exception as e:
        print(f"Error during transcription: {e}")
        return {"error": str(e)}


def ai_text_to_speech(text_content):
    # 为每个请求生成唯一的文件路径
    output_file = f"temp_audio_{uuid.uuid4().hex}.wav"

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-preview-tts",
            contents=text_content,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name='Leda'
                        )
                    )
                ),
            )
        )

        audio_part = response.candidates[0].content.parts[0]
        if not audio_part.inline_data:
            return None

        pcm_data = audio_part.inline_data.data

        with wave.open(output_file, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(24000)
            wf.writeframes(pcm_data)

        return output_file
    except Exception as e:
        print(f"TTS Error: {e}")
        return None


def ai_document_analysis(text):
    """
    Analyze a document using Gemini
    :param text: 文档全文（字符串）
    """
    analysis_instruction = (
        "You are a legal document analysis assistant.\n\n"
        "Analyze the following document and provide:\n"
        "1. Document type and applicable context.\n"
        "2. Key clauses and obligations of the involved parties.\n"
        "3. Important rights, limitations, and responsibilities.\n"
        "4. Potential legal risks, vague clauses, or unfavorable terms for a general user.\n\n"
        "Base your analysis strictly on the document content and use clear, professional language."
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                analysis_instruction,
                text
            ]
        )
        return response.text
    except Exception as e:
        print(f"Document analysis error: {e}")
        return {"error": str(e)}
