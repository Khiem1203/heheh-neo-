import logging
from typing import Dict, Any, Optional
from app.db.database import get_db_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProfileService:
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches user profile from database joining users and user_profiles.
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                SELECT u.name, u.role, p.height_cm, p.weight_kg, p.allergies, p.dietary_restrictions 
                FROM users u
                LEFT JOIN user_profiles p ON u.id = p.user_id
                WHERE u.id = ?
            ''', (user_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        except Exception as e:
            logger.error(f"Error fetching user profile: {e}")
            return None
        finally:
            conn.close()

profile_service = ProfileService()
