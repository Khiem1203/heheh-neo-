from pydantic import BaseModel
from typing import Optional, List

class ScheduleItem(BaseModel):
    id: Optional[int] = None
    user_id: str
    drug_name: str
    dosage: str
    intake_time: str
    tray_id: Optional[int] = None
    is_active: bool = True

class ScheduleResponse(BaseModel):
    items: List[ScheduleItem]

class OCRToScheduleRequest(BaseModel):
    user_id: str
    medicines: List[dict] # From OCR output
    patient_name: Optional[str] = None
    diagnosis: Optional[str] = None
