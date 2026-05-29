from typing import List, Dict, Any
from app.db.database import get_db_connection
from app.services.profile_service import profile_service
import datetime

class SchedulerService:
    def __init__(self):
        pass

    async def add_schedules_from_ocr(self, user_id: str, ocr_medicines: List[Dict[str, Any]], patient_name: str = None, diagnosis: str = None):
        """
        Saves extracted OCR medicines to the database for the next 7 days.
        Includes safety check against user allergies.
        """
        print(f"DEBUG: Syncing OCR for user {user_id}. Medicines: {len(ocr_medicines) if ocr_medicines else 0}")
        user_profile = await profile_service.get_user_profile(user_id)
        allergies = user_profile.get("allergies", "").lower() if user_profile else ""
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            for med in ocr_medicines:
                drug_name = med.get('name', 'Unknown Medication')
                dosage = med.get('dosage') or med.get('dose', 'N/A')
                frequency = med.get('frequency') or med.get('directions', 'once daily')
                
                # Robust type casting
                try:
                    motor_index = int(med.get('motor_index') or med.get('tray_id') or 1)
                except:
                    motor_index = 1
                    
                try:
                    pill_count = int(med.get('pill_count', 1))
                except:
                    pill_count = 1

                time_slots = med.get('time_slots')

                # 1. Safety Check
                if drug_name.lower() in allergies:
                    print(f"SAFETY ALERT: {drug_name} conflicts with user allergies!")
                    continue

                # 2. Determine Intake Times
                if time_slots and isinstance(time_slots, list):
                    times = time_slots
                else:
                    # Fallback logic based on frequency
                    times = ["08:00"]
                    if "twice" in frequency.lower() or "2 times" in frequency.lower():
                        times = ["08:00", "20:00"]
                    elif "thrice" in frequency.lower() or "3 times" in frequency.lower():
                        times = ["08:00", "14:00", "20:00"]

                for day in range(7):
                    date = datetime.date.today() + datetime.timedelta(days=day)
                    for t in times:
                        cursor.execute('''
                        INSERT INTO schedules (user_id, drug_name, dosage, intake_time, tray_id, pill_count, pills_remaining, capacity)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        ''', (user_id, drug_name, dosage, f"{date} {t}", motor_index, pill_count, 30, 30))
            
            conn.commit()
            print("DEBUG: OCR Sync Successful.")
            return True
        except Exception as e:
            print(f"DEBUG: OCR Sync Failed: {e}")
            conn.rollback()
            raise e
        finally:
            conn.close()

    def get_user_schedules(self, user_id: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM schedules WHERE user_id = ? AND is_active = 1 ORDER BY intake_time ASC', (user_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

scheduler_service = SchedulerService()
