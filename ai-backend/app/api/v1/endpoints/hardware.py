from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.services.mqtt_service import send_motor_command
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class DispenseRequest(BaseModel):
    motor_index: int
    pill_count: int

@router.post("/dispense")
async def dispense_pills(request: DispenseRequest):
    """
    Manually triggers a pill dispense command via MQTT.
    Inventory is updated when the hardware confirms the dispense via status message.
    """
    if request.motor_index == 3:
        raise HTTPException(status_code=400, detail="Tray 3 is currently disabled for safety.")

    if request.pill_count <= 0:
        raise HTTPException(status_code=400, detail="Pill count must be greater than zero.")

    try:
        # 1. Trigger Hardware via MQTT
        success = send_motor_command(request.motor_index, request.pill_count)
        
        if success:
            return {"status": "success", "message": f"MQTT command sent to Tray {request.motor_index} for {request.pill_count} pills."}
        else:
            logger.error("MQTT ERROR: send_motor_command returned False")
            return JSONResponse(
                status_code=500, 
                content={"status": "error", "message": "Failed to publish MQTT command to hardware"}
            )
    except Exception as e:
        logger.error(f"CRITICAL MQTT Error: {str(e)}")
        print(f"MQTT Error: {str(e)}")
        return JSONResponse(
            status_code=500, 
            content={"status": "error", "message": "MQTT connection temporarily unavailable"}
        )
