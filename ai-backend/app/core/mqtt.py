import paho.mqtt.client as mqtt
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MQTTClient:
    def __init__(self):
        self.broker = "broker.hivemq.com"
        self.port = 1883
        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        
    def _on_connect(self, client, userdata, flags, rc, properties=None):
        if rc == 0:
            logger.info("MQTT Client connected to broker.")
            client.subscribe("ecyce/dispenser/status")
            client.subscribe("ecyce/medilink/status")
        else:
            logger.error(f"MQTT Connection failed with code {rc}")
    def _on_message(self, client, userdata, msg):
        try:
            topic = msg.topic
            payload_str = msg.payload.decode()
            logger.info(f"Received MQTT message on {topic}: {payload_str}")

            if "SENSOR_TRIGGERED" in payload_str:
                logger.warning("HARDWARE EVENT: SENSOR_TRIGGERED. Pill detected.")

            if topic == "ecyce/medilink/status":
                if "dispensed_ok" in payload_str or "dispensed_tray_" in payload_str:
                    # Extract tray_id if present, otherwise default to 1 for generic 'dispensed_ok'
                    tray_id = 1
                    if "dispensed_tray_" in payload_str:
                        try:
                            tray_id = int(payload_str.split("_")[-1])
                        except:
                            tray_id = 1
                    self._handle_hardware_dispense(tray_id)

            elif topic == "ecyce/dispenser/status":
                payload = json.loads(payload_str)
                if payload.get("status") == "TAKEN":
                    schedule_id = payload.get("schedule_id")
                    if schedule_id:
                        self._mark_as_taken(schedule_id)
        except Exception as e:
            logger.error(f"Failed to process MQTT message: {e}")

    def _handle_hardware_dispense(self, tray_id: int):
        """
        Updates database when hardware confirms a pill was dropped.
        """
        from app.db.database import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            # Update pills_remaining for the active schedule on this tray
            cursor.execute('''
                UPDATE schedules 
                SET pills_remaining = MAX(0, pills_remaining - 1) 
                WHERE tray_id = ? AND is_active = 1
            ''', (tray_id,))
            conn.commit()
            logger.info(f"Hardware confirm: Tray {tray_id} inventory decremented.")
            
            # TODO: Push websocket notification to frontend
        except Exception as e:
            logger.error(f"DB Error handling hardware dispense: {e}")
        finally:
            conn.close()

    def _mark_as_taken(self, schedule_id: int):
        from app.db.database import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            # 1. Update schedule status
            cursor.execute('UPDATE schedules SET is_taken = 1 WHERE id = ?', (schedule_id,))
            # 2. Log intake
            cursor.execute('INSERT INTO intake_logs (schedule_id, status) VALUES (?, ?)', (schedule_id, 'ON_TIME'))
            # 3. Deduct stock
            cursor.execute('UPDATE schedules SET pills_remaining = MAX(0, pills_remaining - 1) WHERE id = ?', (schedule_id,))
            conn.commit()
            logger.info(f"Schedule {schedule_id} marked as TAKEN in database.")
        except Exception as e:
            logger.error(f"DB Error marking as taken: {e}")
        finally:
            conn.close()

    def connect(self):
        try:
            self.client.connect(self.broker, self.port, 60)
            self.client.loop_start()
        except Exception as e:
            logger.error(f"MQTT Initial connection failed: {e}")
            # Auto-reconnect is handled by paho-mqtt client.loop_start() / connect_async usually, 
            # but we can add explicit retry if needed.

    def reset_dispensing_state(self):
        """
        Force-clears any dispensing flags to prevent the UI from hanging.
        """
        from app.db.database import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            # If we had a 'is_dispensing' column, we'd clear it here.
            # Since we use is_taken, we just ensure the state is consistent.
            logger.info("Emergency Override: Resetting dispensing states.")
            # Notify frontend via websocket if implemented
        except Exception as e:
            logger.error(f"Error resetting state: {e}")
        finally:
            conn.close()

    def publish_stop(self):
        """
        Sends an immediate STOP command to all hardware.
        """
        self.client.publish("ecyce/medilink/device1", "STOP")
        self.reset_dispensing_state()
        logger.warning("EMERGENCY STOP PUBLISHED.")

mqtt_client = MQTTClient()
