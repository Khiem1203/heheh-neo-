import asyncio
import datetime
import logging
from app.db.database import get_db_connection
from app.services.mqtt_service import send_motor_command

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MQTTWorker")

async def mqtt_scheduler_worker():
    """
    Background worker that checks for due medications every minute and triggers MQTT dispensing.
    """
    while True:
        try:
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
            logger.info(f"Checking for schedules at {now}")
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Find schedules that match current minute and aren't taken
            cursor.execute('''
            SELECT * FROM schedules 
            WHERE intake_time LIKE ? AND is_taken = 0 AND is_active = 1
            ''', (f"%{now}%",))
            
            due_schedules = cursor.fetchall()
            
            if due_schedules:
                for schedule in due_schedules:
                    logger.info(f"DUE: {schedule['drug_name']} for user {schedule['user_id']}")
                    motor_index = schedule['tray_id'] or 1
                    pill_count = schedule.get('pill_count', 1)
                    
                    success = send_motor_command(motor_index, pill_count)
                    if success:
                        logger.info(f"MQTT SUCCESS: Sent scheduled command for {schedule['drug_name']}")
                        # Mark as taken to avoid double-dispensing
                        cursor.execute('UPDATE schedules SET is_taken = 1 WHERE id = ?', (schedule['id'],))
                        conn.commit()
                    else:
                        logger.error(f"MQTT ERROR: Failed to send command for {schedule['drug_name']}")
            
            conn.close()
        except Exception as e:
            logger.error(f"Scheduler worker error: {e}")
            
        await asyncio.sleep(60) # Check every minute
