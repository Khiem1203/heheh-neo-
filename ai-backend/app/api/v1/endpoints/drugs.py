from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.services.openfda_service import open_fda_service

router = APIRouter()

class DrugInteractionRequest(BaseModel):
    drugs: List[str]

@router.post("/interactions")
async def get_interactions(request: DrugInteractionRequest):
    try:
        data = await open_fda_service.check_interactions(request.drugs)
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
