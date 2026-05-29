from fastapi import APIRouter, HTTPException, Body, File, UploadFile, Form
from app.db.database import get_db_connection
from app.services.face_recognition_service import face_recognition_service
from pydantic import BaseModel
from typing import List, Optional
import json
import numpy as np
import uuid
import os

router = APIRouter()

class StandardLoginRequest(BaseModel):
    username: str
    password: str

class PinLoginRequest(BaseModel):
    username: str
    pin: str

class FaceRegisterRequest(BaseModel):
    user_id: str
    face_image: str # Base64

class ProfileUpdateRequest(BaseModel):
    user_id: Optional[str] = None
    username: Optional[str] = None
    full_name: str
    height_cm: float
    weight_kg: float
    allergies: Optional[str] = ""
    dietary_restrictions: Optional[str] = ""

class EnrollFullRequest(BaseModel):
    username: str
    password: str
    name: str
    pin: str
    height: Optional[float] = None
    weight: Optional[float] = None
    allergies: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    face_image: str # Base64

@router.post("/enroll-full")
async def enroll_full(request: EnrollFullRequest):
    """
    Combined enrollment: Creates user, saves face image, and initializes profile.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    step_name = "Initialization"
    try:
        user_id = str(uuid.uuid4())
        
        # Step 1: Create User
        step_name = "Create User"
        cursor.execute('''
            INSERT INTO users (id, username, password, name, pin, height, weight, allergies, is_onboarded)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        ''', (user_id, request.username, request.password, request.name, request.pin, 
              request.height, request.weight, request.allergies))
        
        # Step 2: Initialize Profile
        step_name = "Initialize Profile"
        cursor.execute('''
            INSERT INTO user_profiles (user_id, full_name, height_cm, weight_kg, allergies, dietary_restrictions)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (user_id, request.name, request.height or 0, request.weight or 0, request.allergies or "", request.dietary_restrictions or ""))

        # Step 3: Save Face Image
        step_name = "Save Face Image"
        face_recognition_service.register_face(request.face_image, request.username)
        
        step_name = "Commit Transaction"
        conn.commit()
        return {
            "status": "success",
            "data": {"user_id": user_id, "is_onboarded": True, "name": request.name}
        }
    except Exception as e:
        print(f"ENROLL-FULL FAILED AT STEP: {step_name}")
        print(f"ERROR DETAILS: {str(e)}")
        conn.rollback()
        return {
            "status": "error",
            "step": step_name,
            "message": str(e)
        }
    finally:
        conn.close()

@router.post("/login")
async def login(request: StandardLoginRequest):
    """
    Mock password logic: Success if username exists and password is not empty.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, name, role, is_onboarded FROM users WHERE username = ?", (request.username,))
        user = cursor.fetchone()
        # RULE: Username exists AND password length > 0
        if user and len(request.password) > 0:
            return {
                "status": "success",
                "data": {
                    "user_id": user["id"],
                    "name": user["name"],
                    "role": user["role"],
                    "is_onboarded": bool(user["is_onboarded"])
                }
            }
        raise HTTPException(status_code=401, detail="Invalid username or password")
    finally:
        conn.close()

@router.post("/pin-login")
async def pin_login(request: PinLoginRequest):
    """
    PIN Bypass: Success if username exists AND pin is any 4 digits.
    """
    if len(request.pin) != 4 or not request.pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN must be a 4-digit numeric string")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, name, role, is_onboarded FROM users WHERE username = ?", (request.username,))
        user = cursor.fetchone()
        if user:
            return {
                "status": "success",
                "data": {
                    "user_id": user["id"],
                    "name": user["name"],
                    "role": user["role"],
                    "is_onboarded": bool(user["is_onboarded"])
                }
            }
        # Fallback for prototype testing if user doesn't exist
        return {
            "status": "success",
            "data": {
                "user_id": "test_user_id",
                "name": "Test User",
                "role": "user",
                "is_onboarded": False
            }
        }
    finally:
        conn.close()

@router.post("/register-face")
async def register_face(request: FaceRegisterRequest):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT username FROM users WHERE id = ?", (request.user_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            face_recognition_service.register_face(request.face_image, row["username"])
            return {"status": "success", "message": "Face registered successfully"}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-face")
async def verify_face(username: str = Form(...), file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        contents = await file.read()
        result = await face_recognition_service.verify_face(contents, username)
        
        if result["verified"]:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, role, is_onboarded FROM users WHERE username = ?", (username,))
            user = cursor.fetchone()
            conn.close()
            
            return {
                "status": "success",
                "data": {
                    "user_id": user["id"],
                    "name": user["name"],
                    "role": user["role"],
                    "is_onboarded": bool(user["is_onboarded"])
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Face not recognized")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/profile")
async def update_profile(request: ProfileUpdateRequest):
    print(f"DEBUG: Received Profile Update Request: {request.dict()}")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        target_user_id = request.user_id
        
        # Fallback: Find user_id by username if user_id is missing
        if not target_user_id and request.username:
            cursor.execute("SELECT id FROM users WHERE username = ?", (request.username,))
            row = cursor.fetchone()
            if row:
                target_user_id = row["id"]
        
        if not target_user_id:
            raise HTTPException(status_code=400, detail="User ID or Username required")

        # 1. Update Profile
        cursor.execute('''
            INSERT OR REPLACE INTO user_profiles 
            (user_id, full_name, height_cm, weight_kg, allergies, dietary_restrictions)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (target_user_id, request.full_name, request.height_cm, request.weight_kg, request.allergies, request.dietary_restrictions))
        
        # 2. Mark as Onboarded
        cursor.execute("UPDATE users SET is_onboarded = 1 WHERE id = ?", (target_user_id,))
        
        conn.commit()
        print(f"DEBUG: Profile updated for user {target_user_id} and marked as onboarded.")
        return {"status": "success", "message": "Profile updated successfully"}
    except Exception as e:
        print(f"ERROR: Database failed to save profile: {e}")
        conn.rollback()
        return {
            "status": "error",
            "message": "Internal Server Error during profile save",
            "detail": str(e)
        }
    finally:
        conn.close()

@router.get("/profile/{user_id}")
async def get_profile(user_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM user_profiles WHERE user_id = ?", (user_id,))
        profile = cursor.fetchone()
        if profile:
            return {"status": "success", "data": dict(profile)}
        raise HTTPException(status_code=404, detail="Profile not found")
    finally:
        conn.close()
