import os
from pathlib import Path
from dotenv import load_dotenv

# Force path to look for .env inside ai-backend/
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

openrouter_key = os.getenv("OPENROUTER_API_KEY")
google_key = os.getenv("GOOGLE_API_KEY")

if openrouter_key:
    print("SUCCESS: OpenRouter API Key loaded successfully. System Status: Ready.")
elif google_key:
    print("WARNING: OpenRouter Key not found, using Legacy Google API Key.")
else:
    print("CRITICAL: No AI API Key found! System Status: Error.")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1.endpoints import drugs, chat, face, schedules, intake, admin, analysis, prescriptions, auth, hardware
from app.api.v1 import prescription

from app.db.database import init_db
from app.core.mqtt import mqtt_client
from app.services.openrouter_service import openrouter_service
import asyncio
from app.services.mqtt_worker import mqtt_scheduler_worker
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print("CORE: Initializing Database...")
    init_db()
    
    try:
        print("CORE: Connecting to MQTT Broker...")
        mqtt_client.connect()
    except Exception as e:
        print(f"MQTT ERROR: Connection failed: {e}")
    
    # Start MQTT worker task
    print("CORE: Starting Scheduler Worker...")
    worker_task = asyncio.create_task(mqtt_scheduler_worker())
    
    yield
    
    # Shutdown logic
    print("CORE: Shutting down Scheduler Worker...")
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass
    
    print("CORE: Cleanup complete.")

app = FastAPI(title="Ecyce MediLink AI Backend", version="1.0.0", lifespan=lifespan)

# Mount Static Files
os.makedirs("app/static/uploads/prescriptions", exist_ok=True)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to Next.js origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(drugs.router, prefix="/api/v1/drugs", tags=["Drugs"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
# REMOVED OCR ROUTER - Consolidating to prescription router
app.include_router(face.router, prefix="/api/v1/face", tags=["Face ID"])
app.include_router(schedules.router, prefix="/api/v1/schedules", tags=["Schedules"])
app.include_router(intake.router, prefix="/api/v1/intake", tags=["Intake"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["Analysis"])
app.include_router(prescriptions.router, prefix="/api/v1/prescriptions", tags=["Prescriptions"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(hardware.router, prefix="/api/v1/hardware", tags=["Hardware"])
app.include_router(prescription.router, prefix="/api/v1/prescription", tags=["Intelligent OCR Router"])

@app.get("/")
async def root():
    return {"status": "online", "message": "Ecyce MediLink AI Backend is running."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
