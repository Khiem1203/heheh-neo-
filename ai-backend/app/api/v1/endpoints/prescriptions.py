from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from app.db.database import get_db_connection
from app.services.openrouter_service import openrouter_service
from app.services.profile_service import profile_service
import uuid
import os
import json
import base64
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = "app/static/uploads/prescriptions"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_prescription(user_id: str, file: UploadFile = File(...)):
    """
    Saves prescription image, runs GPT-4o OCR via OpenRouter, and stores result in DB.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    # 1. Generate Unique Filename
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # 2. Save File
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")

    # 3. Get User Profile for Safety Cross-Reference
    user_profile = await profile_service.get_user_profile(user_id)

    # 4. Run GPT-4o OCR & Analysis via OpenRouter
    try:
        image_base64 = base64.b64encode(contents).decode('utf-8')
        # We can pass user_profile to a modified analyze function or handle safety check in prompt
        # For now, we'll use the existing analyze_prescription_with_gpt4o
        ocr_result = await openrouter_service.analyze_prescription_with_gpt4o(image_base64, filename)
    except Exception as e:
        ocr_result = {
            "status": "Warning",
            "medications": [],
            "analysis_report": f"OCR Analysis failed: {str(e)}"
        }

    # 5. Store in Database
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        prescription_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO prescriptions (id, user_id, image_path, extracted_data)
            VALUES (?, ?, ?, ?)
        ''', (prescription_id, user_id, file_path, json.dumps(ocr_result)))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

    return {
        "status": "success",
        "prescription_id": prescription_id,
        "image_path": file_path,
        "data": ocr_result
    }

@router.get("/user/{user_id}")
async def get_user_prescriptions(user_id: str):
    """
    Retrieves all prescriptions for a specific user.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM prescriptions WHERE user_id = ? ORDER BY created_at DESC', (user_id,))
        rows = cursor.fetchall()
        return {"data": [dict(row) for row in rows]}
    finally:
        conn.close()
