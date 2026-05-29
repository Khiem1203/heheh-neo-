from typing import List, Dict, Any
from app.db.database import get_db_connection
from datetime import datetime, timedelta

class IntakeService:
    def __init__(self):
        pass

    def record_intake(self, schedule_id: int, status: str):
        """
        Records a medication intake event.
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Update schedule status if taken today
        if status in ["TAKEN", "ON_TIME", "LATE"]:
            cursor.execute('UPDATE schedules SET is_taken = 1 WHERE id = ?', (schedule_id,))
            
            # Deduct pill count if it's a dispense event
            cursor.execute('UPDATE schedules SET pills_remaining = MAX(0, pills_remaining - 1) WHERE id = ?', (schedule_id,))
        
        # 2. Insert log
        cursor.execute('''
        INSERT INTO intake_logs (schedule_id, status)
        VALUES (?, ?)
        ''', (schedule_id, status))
        
        conn.commit()
        conn.close()

    def get_adherence_stats(self, user_id: str):
        """
        Calculates adherence statistics for the UI chart.
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get logs for the last 7 days for this user's schedules
        cursor.execute('''
        SELECT status, COUNT(*) as count 
        FROM intake_logs il
        JOIN schedules s ON il.schedule_id = s.id
        WHERE s.user_id = ? AND il.taken_at >= datetime('now', '-7 days')
        GROUP BY status
        ''', (user_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        stats = {"TAKEN": 0, "MISSED": 0, "LATE": 0, "ON_TIME": 0}
        for row in rows:
            stats[row['status']] = row['count']
            
        return stats

    def get_7_day_report(self, user_id: str):
        """
        Generates a day-by-day report for the last 7 days.
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        report = []
        for i in range(6, -1, -1):
            date_str = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            
            cursor.execute('''
            SELECT status, COUNT(*) as count 
            FROM intake_logs il
            JOIN schedules s ON il.schedule_id = s.id
            WHERE s.user_id = ? AND date(il.taken_at) = ?
            GROUP BY status
            ''', (user_id, date_str))
            
            day_data = {"date": date_str, "TAKEN": 0, "MISSED": 0}
            rows = cursor.fetchall()
            for row in rows:
                if row['status'] in ['TAKEN', 'ON_TIME', 'LATE']:
                    day_data["TAKEN"] += row['count']
                else:
                    day_data["MISSED"] += row['count']
            
            report.append(day_data)
            
        conn.close()
        return report

intake_service = IntakeService()
