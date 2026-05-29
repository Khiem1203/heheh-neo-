import sqlite3
import os
import logging

DATABASE_PATH = "medilink.db"
logger = logging.getLogger("Database")

def get_db_connection():
    # Ensure the database is in the correct directory (ai-backend)
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    db_path = os.path.join(base_dir, DATABASE_PATH)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # ... (rest of create table statements)
    
    # Users Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        pin TEXT NOT NULL,
        height REAL,
        weight REAL,
        allergies TEXT,
        face_data_path TEXT,
        role TEXT DEFAULT 'user',
        is_onboarded INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # User Profiles Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_profiles (
        user_id TEXT PRIMARY KEY,
        full_name TEXT,
        height_cm REAL,
        weight_kg REAL,
        allergies TEXT,
        dietary_restrictions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    # User Biometrics Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_biometrics (
        user_id TEXT PRIMARY KEY,
        face_descriptor TEXT, -- JSON string of the vector
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Medication Schedules Table
    # Added is_taken, pills_remaining, capacity, pill_count
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        drug_name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        intake_time TEXT NOT NULL,
        tray_id INTEGER,
        pill_count INTEGER DEFAULT 1,
        pills_remaining INTEGER DEFAULT 0,
        capacity INTEGER DEFAULT 30,
        is_taken INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Medication Intake Logs
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS intake_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        schedule_id INTEGER NOT NULL,
        status TEXT NOT NULL, -- TAKEN, MISSED, LATE
        taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (schedule_id) REFERENCES schedules (id)
    )
    ''')

    # Prescriptions Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS prescriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        image_path TEXT NOT NULL,
        extracted_data TEXT, -- JSON string from Gemini
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Migration: Add pill_count if it doesn't exist
    cursor.execute("PRAGMA table_info(schedules)")
    columns = [row[1] for row in cursor.fetchall()]
    if 'pill_count' not in columns:
        logger.info("Migration: Adding pill_count column to schedules table")
        cursor.execute('ALTER TABLE schedules ADD COLUMN pill_count INTEGER DEFAULT 1')

    conn.commit()
    conn.close()

if __name__ == "__main__":
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("DBInit")
    init_db()
