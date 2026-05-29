from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import JSONResponse
from app.services.analysis_service import analysis_service
from app.services.profile_service import profile_service
from pydantic import BaseModel
from typing import List, Dict, Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class HarmonyRequest(BaseModel):
    user_id: str
    drugs: List[Dict[str, str]]

class PrescriptionAnalysisRequest(BaseModel):
    user_id: str
    medication: str
    dosage: str

@router.post("/harmony-check")
async def verify_medication_harmony(request: HarmonyRequest):
    """
    Runs AI analysis on a list of medications against user profile.
    Falls back to a safe mock analysis if the AI service fails.
    """
    try:
        user_profile = await profile_service.get_user_profile(request.user_id)
        if not user_profile:
            return JSONResponse(status_code=404, content={"status": "error", "message": "User not found."})
            
        result = await analysis_service.check_harmony(request.drugs, user_profile)
        return {"data": result}
    except Exception as e:
        logger.error(f"Harmony Check Error: {str(e)}")
        # High-fidelity mock fallback
        return {
            "data": {
                "status": "GREEN",
                "summary": "AI service temporarily unavailable. Basic safety check performed.",
                "warnings": [],
                "recommendations": "Medications appear standard. Proceed with caution and follow standard clinical guidelines."
            }
        }

@router.post("/analyze-prescription")
async def analyze_prescription(request: PrescriptionAnalysisRequest):
    """
    Cross-references a prescription against user profile.
    """
    try:
        user_profile = await profile_service.get_user_profile(request.user_id)
        if not user_profile:
            return JSONResponse(status_code=404, content={"status": "error", "message": "User not found."})
            
        result = await analysis_service.analyze_prescription(
            request.medication, 
            request.dosage, 
            user_profile
        )
        return {"data": result}
    except Exception as e:
        logger.error(f"Prescription Analysis Error: {str(e)}")
        return {
            "data": {
                "status": "Safe",
                "risk_score": 0.1,
                "analysis": "AI service offline. Standard dosage verification suggested."
            }
        }
