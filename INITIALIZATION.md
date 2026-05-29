# Project Initialization Guide: Ecyce MediLink

This document provides instructions on how to initialize and run the Backend, Database, and Frontend for the Ecyce MediLink project.

## Prerequisites

- **Python 3.10+**: Required for the backend.
- **Node.js 18+**: Required for the frontend.
- **Ollama**: Required for AI features (Llama 3.2). [Download Ollama](https://ollama.com/)
- **SQLite3**: Usually comes pre-installed with Python.

---

## 1. Database Initialization

The project uses SQLite. You need to create the database schema before running the application.

1. Open a terminal in the project root.
2. Run the initialization script:
   ```powershell
   python ai-backend/app/db/database.py
   ```
   *This creates `medilink.db` in the current directory.*

3. (Optional) Run the update script to ensure all modern columns are added:
   ```powershell
   python update_db.py
   ```

---

## 2. Backend Initialization (FastAPI)

1. Navigate to the backend directory:
   ```powershell
   cd ai-backend
   ```

2. Install the required Python packages:
   ```powershell
   pip install -r requirements.txt
   ```

3. **Ensure Ollama is running:**
   - Start the Ollama application.
   - Pull the required model:
     ```powershell
     ollama pull llama3.2:1b
     ```

4. Start the backend server:

   **Crucial:** Ensure you are in the `ai-backend` directory (not the `app` subdirectory).
   ```powershell
   cd C:\Users\Nate Ven\eml2.0\ai-backend
   ```

   Run the server using the module flag (this handles the `app` module pathing automatically):
   ```powershell
   python -m uvicorn app.main:app --reload
   ```

   *Note: If `python` refers to an older version on your machine, you might need to use `python3`.*

   The backend will run at `http://localhost:8000`.

---

## 3. Frontend Initialization (Next.js)

1. Navigate to the frontend directory:
   ```powershell
   cd my-app
   ```

2. Install the required Node packages:
   ```powershell
   npm install
   ```

3. Start the development server:
   ```powershell
   npm run dev
   ```
   *The frontend will run at `http://localhost:3000`.*

---

## Summary of Services

| Service | Port | Description |
| --- | --- | --- |
| **Backend** | 8000 | FastAPI REST API |
| **Frontend** | 3000 | Next.js Web Interface |
| **Ollama** | 11434 | Local AI Inference |
| **MQTT Broker**| 1883 | `broker.hivemq.com` (Cloud) |

## Troubleshooting

- **Database Path:** If the backend cannot find the database, ensure you are running the `main.py` script from a consistent directory or check the `DATABASE_PATH` in `ai-backend/app/db/database.py`.
- **CORS Errors:** The backend is configured to allow all origins by default in `main.py` for development.
- **Ollama Connection:** If the AI chat fails, verify that Ollama is running and the model `llama3.2:1b` is pulled.
