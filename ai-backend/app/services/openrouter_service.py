import os
import json
import logging
import base64
import asyncio
from fastapi import HTTPException
from typing import Dict, Any, List, Optional
from openai import AsyncOpenAI
from pathlib import Path
from dotenv import load_dotenv

# Absolute path loader for .env
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
MODEL_NAME = "openai/gpt-4o"

class OpenRouterService:
    def __init__(self):
        self.client = AsyncOpenAI(
            base_url=OPENROUTER_BASE_URL,
            api_key=OPENROUTER_API_KEY,
        )

    async def analyze_prescription_with_gpt4o(self, image_base64: str, filename: str = "") -> Dict[str, Any]:
        """
        Extracts structured medication data from a prescription image using GPT-4o via OpenRouter.
        Uses the official OpenAI client library (Async).
        """
        prompt = """
        You are a highly accurate medical OCR system. Extract the following information from this prescription image:
        1. Patient Name
        2. Medications (an array of objects with: name, dosage, frequency, motor_index, pill_count, time_slots)

        Mapping Rules:
        - name: The specific brand or generic name.
        - dosage: The strength (e.g., 500mg).
        - frequency: The frequency (e.g., twice daily).
        - motor_index: 
            - Panadol/Paracetamol/Painkillers: 1
            - Dexchlorpheniramine/Antihistamines: 2
            - Antibiotics/Amoxicillin: 3
            - Others: 4
        - pill_count: Number of pills to take per dose.
        - time_slots: Array of times (e.g., ["08:00", "20:00"]) based on frequency.

        Return ONLY a clean JSON object with this structure:
        {
            "patient_name": "string",
            "medications": [
                {
                    "name": "string",
                    "dosage": "string",
                    "frequency": "string",
                    "motor_index": integer,
                    "pill_count": integer,
                    "time_slots": ["HH:MM"]
                }
            ],
            "status": "Safe",
            "analysis_report": "Concise summary of extraction and safety check."
        }
        """

        try:
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=MODEL_NAME,
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{image_base64}"
                                    }
                                }
                            ]
                        }
                    ],
                    response_format={"type": "json_object"}
                ),
                timeout=30.0 # 30 second timeout for AI processing
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except asyncio.TimeoutError:
            logger.error("OpenRouter OCR Timeout (30s exceeded)")
            raise HTTPException(status_code=504, detail="AI analysis timed out. Please try again.")
        except Exception as e:
            logger.error(f"OpenRouter OCR Error: {str(e)}")
            raise e

    async def chat_health_companion(self, messages: List[Dict[str, str]], user_profile: Optional[Dict[str, Any]] = None, lang: str = "en") -> str:
        """
        Medical Q&A using GPT-4o via OpenRouter.
        """
        persona = "You are the Ecyce MediLink Medical Analyzer. Do not give generic 'consult a doctor' dismissals. Analyze the user's query contextually. If asked about medication like Paracetamol, explain the mechanism, safe dosages based on standard guidelines, and practical advice (e.g., drinking water). Always provide a helpful, analytical answer first, followed by a brief standard medical disclaimer at the very end."
        
        if user_profile:
            persona += f" You are talking to {user_profile.get('name', 'User')}."
            if user_profile.get('weight_kg'):
                persona += f" They weigh {user_profile['weight_kg']}kg."
            if user_profile.get('height_cm'):
                persona += f" They are {user_profile['height_cm']}cm tall."
            if user_profile.get('allergies'):
                persona += f" They are allergic to: {user_profile['allergies']}."

        lang_instruction = "Respond concisely in English." if lang == "en" else "Hãy trả lời ngắn gọn bằng tiếng Việt."
        
        system_message = {"role": "system", "content": f"{persona} {lang_instruction} Always prioritize safety."}
        
        # Combine system message with conversation history
        full_messages = [system_message] + messages

        try:
            response = await self.client.chat.completions.create(
                model=MODEL_NAME,
                messages=full_messages
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenRouter Chat Error: {str(e)}")
            return f"I'm sorry, I'm having trouble connecting to my AI core. Error: {str(e)}"

openrouter_service = OpenRouterService()
