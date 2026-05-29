import cv2
import numpy as np
from PIL import Image
import io
import base64
import uuid
import os
from typing import Dict, Any
from app.db.database import get_db_connection

class FaceIDService:
    def __init__(self):
        self.enrollment_dir = "data/faces"
        if not os.path.exists(self.enrollment_dir):
            os.makedirs(self.enrollment_dir, exist_ok=True)

    def enroll_user(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Saves user info and face image to database and local storage.
        """
        user_id = str(uuid.uuid4())
        
        # 1. Save face image
        face_image_path = ""
        if data.get("face_image"):
            try:
                header, encoded = data["face_image"].split(",", 1)
                image_data = base64.b64decode(encoded)
                face_image_path = os.path.join(self.enrollment_dir, f"{user_id}.jpg")
                with open(face_image_path, "wb") as f:
                    f.write(image_data)
            except Exception as e:
                print(f"Error saving face image: {e}")

        # 2. Save to DB
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
            INSERT INTO users (id, username, password, name, pin, height, weight, allergies, face_data_path, role)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id, 
                data["username"], 
                data["password"], 
                data["name"], 
                data["pin"], 
                data.get("height"), 
                data.get("weight"), 
                data.get("allergies"),
                face_image_path,
                'user'
            ))
            conn.commit()
            return {"success": True, "user_id": user_id, "name": data["name"]}
        except Exception as e:
            conn.rollback()
            return {"success": False, "error": str(e)}
        finally:
            conn.close()

    def verify_face(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Processes image to detect and verify face.
        Simulation: Matches the 'test' user or assumes success for demo.
        """
        # 1. Load Image from bytes
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"verified": False, "error": "Invalid image data"}

        # 2. Mock Verification Logic
        # In a real setup, we would use MediaPipe to detect and ArcFace to compare embeddings
        return {
            "verified": True,
            "user_id": "usr_ecyce_001",
            "name": "Nghia Ven",
            "confidence": 0.985
        }

face_id_service = FaceIDService()
