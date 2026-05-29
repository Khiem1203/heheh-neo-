# Ecyce MediLink 2.0

Smart Medicine Box Dashboard with AI Health Assistant and Real-time Hardware Integration.

## Project Structure

- **`my-app/`**: Next.js React Frontend Dashboard.
  - Built with TypeScript, TailwindCSS, and Zustand.
  - Integrates with MQTT for real-time hardware status.
  - Features AI Health Assistant using Ollama.
- **`hardware/`**: ESP32 Firmware for the physical medicine box.
  - Built using PlatformIO and the Arduino framework.
  - Uses `PubSubClient` for MQTT communication.
  - Controls motors and sensors for pill dispensing.
- **`ai-backend/`**: FastAPI Backend for AI and Data Processing.
  - Handles OCR, Face ID, and AI Chat logic.

## MQTT Integration

The project uses a real-time MQTT feed to synchronize the hardware device with the web dashboard.

### Broker Configuration
- **Broker Host:** `broker.hivemq.com`
- **Port:** `1883` (Hardware) / `8884` (Web WSS)
- **Topic:** `ecyce/medilink/device1`

### How to Connect

#### 1. Hardware Setup (ESP32)
1. Navigate to `hardware/include/wifi_config.h`.
2. Update `WIFI_SSID` and `WIFI_PASSWORD` with your local credentials.
3. The device will automatically connect to the HiveMQ broker and publish heartbeats to the defined topic.

#### 2. Frontend Setup (Dashboard)
1. The dashboard connects via `my-app/lib/mqtt-client.ts`.
2. It uses the `MqttProvider` to share connection status across the application.
3. Real-time status is displayed in the "Health Overview" header.

## Getting Started

### Backend
```powershell
cd ai-backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Frontend
```powershell
cd my-app
npm install
npm run dev
```

### Hardware
Use PlatformIO to build and upload the firmware in the `hardware/` directory.
