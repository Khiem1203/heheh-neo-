from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.openrouter_service import openrouter_service
from app.services.profile_service import profile_service

router = APIRouter()

class ChatRequest(BaseModel):
    symptoms: str
    current_drugs: List[str]
    lang: Optional[str] = "en"
    user_id: Optional[str] = None

class ChatMessageRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    lang: Optional[str] = "en"

@router.post("/message")
async def chat_message(request: ChatMessageRequest):
    """
    GPT-4o Medical Chat via OpenRouter.
    """
    user_profile = None
    if request.user_id:
        user_profile = await profile_service.get_user_profile(request.user_id)
        
    response = await openrouter_service.chat_health_companion(
        [{"role": "user", "content": request.message}],
        user_profile=user_profile,
        lang=request.lang
    )
    return {"response": response}

@router.post("/symptoms/analyze")
async def analyze_symptoms(request: ChatRequest):
    """
    Expert Medical Consultation via GPT-4o.
    """
    user_profile = None
    if request.user_id:
        user_profile = await profile_service.get_user_profile(request.user_id)

    prompt = f"Analyze these symptoms: {request.symptoms} considering current medications: {', '.join(request.current_drugs)}."
    analysis = await openrouter_service.chat_health_companion(
        [{"role": "user", "content": prompt}],
        user_profile=user_profile,
        lang=request.lang
    )
    return {"analysis": analysis}

@router.websocket("/symptoms/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("action") == "send_message":
                symptoms = data.get("payload", "")
                drugs = data.get("drugs", [])
                lang = data.get("lang", "en")
                user_id = data.get("user_id")
                
                user_profile = None
                if user_id:
                    user_profile = await profile_service.get_user_profile(user_id)

                prompt = f"Analyze these symptoms: {symptoms} considering current medications: {', '.join(drugs)}."
                analysis = await openrouter_service.chat_health_companion(
                    [{"role": "user", "content": prompt}],
                    user_profile=user_profile,
                    lang=lang
                )
                
                # Simple token streaming simulation for GPT-4o
                tokens = analysis.split(" ")
                for token in tokens:
                    await websocket.send_json({"type": "token", "content": token + " "})
                
                await websocket.send_json({"type": "status", "content": "FINISH"})
    except WebSocketDisconnect:
        print("Client disconnected")
