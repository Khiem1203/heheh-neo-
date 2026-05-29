from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.intake_service import intake_service

router = APIRouter()

class IntakeRecordRequest(BaseModel):
    schedule_id: int
    status: str # ON_TIME, DELAYED, MISSED

@router.post("/record")
async def record_intake(request: IntakeRecordRequest):
    """
    Logs a medication dose event.
    """
    try:
        intake_service.record_intake(request.schedule_id, request.status)
        return {"status": "SUCCESS", "message": "Intake recorded."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats/{user_id}")
async def get_stats(user_id: str):
    try:
        stats = intake_service.get_adherence_stats(user_id)
        return {"data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/report/7day/{user_id}")
async def get_7_day_report(user_id: str):
    try:
        report = intake_service.get_7_day_report(user_id)
        return {"data": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
