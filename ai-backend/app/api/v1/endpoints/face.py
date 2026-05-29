from fastapi import APIRouter, File, UploadFile, HTTPException, Body
from app.services.face_service import face_id_service
from app.db.database import get_db_connection
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class FaceEnrollRequest(BaseModel):
    username: str
    password: str
    name: str
    pin: str
    height: Optional[float] = None
    weight: Optional[float] = None
    allergies: Optional[str] = None
    face_image: str # Base64 string from frontend

class PinLoginRequest(BaseModel):
    username: str
    pin: str

class StandardLoginRequest(BaseModel):
    username: str
    password: str

@router.post("/enroll")
async def enroll_face(request: FaceEnrollRequest):
    """
    Endpoint for full user enrollment including face data and health profile.
    """
    try:
        result = face_id_service.enroll_user(request.dict())
        return {"data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify")
async def verify_face(file: UploadFile = File(...)):
    """
    Endpoint for Face ID verification using MediaPipe/ArcFace logic.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        contents = await file.read()
        result = face_id_service.verify_face(contents)
        return {"data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login-pin")
async def pin_login(request: PinLoginRequest):
    """
    Endpoint for PIN-based login.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, name, role FROM users WHERE username = ? AND pin = ?", (request.username, request.pin))
        user = cursor.fetchone()
        if user:
            return {
                "data": {
                    "verified": True,
                    "user_id": user["id"],
                    "name": user["name"],
                    "role": user["role"]
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid username or PIN")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.post("/login-standard")
async def standard_login(request: StandardLoginRequest):
    """
    Endpoint for standard password-based login.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, name, role FROM users WHERE username = ? AND password = ?", (request.username, request.password))
        user = cursor.fetchone()
        if user:
            return {
                "data": {
                    "verified": True,
                    "user_id": user["id"],
                    "name": user["name"],
                    "role": user["role"]
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid username or password")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
