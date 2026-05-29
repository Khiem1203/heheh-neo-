from fastapi import APIRouter, HTTPException
from app.db.database import get_db_connection
from typing import List, Dict, Any

router = APIRouter()

@router.get("/stats")
async def get_admin_stats():
    """
    Aggregates statistics for the Admin Dashboard.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 1. Total Users
        cursor.execute('SELECT COUNT(*) FROM users WHERE role = "user"')
        total_users = cursor.fetchone()[0]
        
        # 2. Global Adherence
        cursor.execute('SELECT status, COUNT(*) FROM intake_logs GROUP BY status')
        adherence_rows = cursor.fetchall()
        adherence = {row[0]: row[1] for row in adherence_rows}
        
        # 3. All Users List
        cursor.execute('SELECT id, name, username, weight, allergies FROM users WHERE role = "user"')
        users = [dict(row) for row in cursor.fetchall()]
        
        return {
            "total_users": total_users,
            "adherence": adherence,
            "users": users,
            "system_health": {
                "mqtt": "ONLINE",
                "ai": "ONLINE",
                "db": "ONLINE"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
