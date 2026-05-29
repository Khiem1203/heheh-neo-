import serial
import serial.tools.list_ports
import threading
import time
import os
import logging
from app.db.database import get_db_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SerialService")

class SerialService:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(SerialService, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        self.port = os.getenv("SERIAL_PORT", "COM3")
        self.baudrate = 115200
        self.serial_conn = None
        self.read_thread = None
        self.running = False
        self._initialized = True
        self.connect()

    def connect(self):
        try:
            self.serial_conn = serial.Serial(self.port, self.baudrate, timeout=1)
            self.running = True
            self.read_thread = threading.Thread(target=self._read_loop, daemon=True)
            self.read_thread.start()
            logger.info(f"Connected to serial port {self.port}")
        except Exception as e:
            logger.error(f"Failed to connect to serial port {self.port}: {e}")

    def disconnect(self):
        self.running = False
        if self.serial_conn:
            self.serial_conn.close()
        if self.read_thread:
            self.read_thread.join(timeout=2)
        logger.info("Disconnected from serial port")

    def send_command(self, command: str):
        if not self.serial_conn or not self.serial_conn.is_open:
            logger.error("Serial connection not open. Attempting to reconnect...")
            self.connect()
            if not self.serial_conn or not self.serial_conn.is_open:
                return False
        
        try:
            full_command = f"{command}\n".encode('utf-8')
            self.serial_conn.write(full_command)
            logger.info(f"Sent command: {command}")
            return True
        except Exception as e:
            logger.error(f"Error sending command: {e}")
            return False

    def _read_loop(self):
        while self.running:
            if self.serial_conn and self.serial_conn.is_open:
                try:
                    line = self.serial_conn.readline().decode('utf-8').strip()
                    if line:
                        logger.info(f"ESP32: {line}")
                        self._handle_response(line)
                except Exception as e:
                    logger.error(f"Error reading from serial: {e}")
                    time.sleep(1)
            else:
                time.sleep(1)

    def _handle_response(self, line: str):
        # Example response: "DONE M1 (SENSOR)"
        if "DONE M" in line and "(SENSOR)" in line:
            try:
                # Extract tray index
                parts = line.split("M")
                if len(parts) > 1:
                    tray_id = int(parts[1].split()[0])
                    logger.info(f"Pill detected for Tray {tray_id}. Updating database...")
                    self._decrement_inventory(tray_id)
            except Exception as e:
                logger.error(f"Error parsing DONE message: {e}")

    def _decrement_inventory(self, tray_id: int):
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            # Decrement for the first active schedule found for this tray
            cursor.execute('''
                UPDATE schedules 
                SET pills_remaining = MAX(0, pills_remaining - 1) 
                WHERE tray_id = ? AND is_active = 1
            ''', (tray_id,))
            conn.commit()
            logger.info(f"Database updated: Decremented inventory for Tray {tray_id}")
        except Exception as e:
            conn.rollback()
            logger.error(f"Database update failed for Tray {tray_id}: {e}")
        finally:
            conn.close()

serial_service = SerialService()
