from fastapi import APIRouter, HTTPException
from app.models.schedule import OCRToScheduleRequest, ScheduleResponse
from app.services.scheduler_service import scheduler_service

router = APIRouter()

@router.post("/sync-ocr")
async def sync_ocr_to_schedule(request: OCRToScheduleRequest):
    """
    Bridge OCR results into the Medication Scheduler.
    """
    try:
        await scheduler_service.add_schedules_from_ocr(
            request.user_id, 
            request.medicines,
            request.patient_name,
            request.diagnosis
        )
        return {"status": "SUCCESS", "message": "Schedules synchronized."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=ScheduleResponse)
async def get_schedules(user_id: str):
    """
    Returns all active schedules for a user.
    """
    try:
        items = scheduler_service.get_user_schedules(user_id)
        return {"items": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
