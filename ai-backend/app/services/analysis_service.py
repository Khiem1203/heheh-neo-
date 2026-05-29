from typing import List, Dict, Any, Optional
from app.services.openrouter_service import openrouter_service
import json

class AnalysisService:
    def __init__(self):
        pass

    async def check_harmony(self, drug_list: List[Dict[str, str]], user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes a list of drugs for interactions and user suitability using GPT-4o via OpenRouter.
        """
        prompt = f"""
        Analyze the following list of medications for a patient.
        
        Patient Profile:
        - Weight: {user_profile.get('weight_kg') or user_profile.get('weight')} kg
        - Allergies: {user_profile.get('allergies')}
        
        Medications:
        {json.dumps(drug_list)}
        
        Instructions:
        1. Identify any potential drug-drug interactions.
        2. Verify if any medication conflicts with the patient's allergies.
        3. Assess if the dosage is appropriate for the patient's weight (if applicable).
        4. Provide a "Harmony Status": "GREEN" (Safe), "YELLOW" (Caution), or "RED" (Danger).
        5. Return ONLY a JSON object with: "status", "summary", "warnings" (list), "recommendations".
        
        Return ONLY a clean JSON object.
        """
        
        try:
            response_content = await openrouter_service.chat_health_companion(
                [{"role": "user", "content": prompt}],
                user_profile=user_profile
            )
            # Find the JSON part in the response
            start_idx = response_content.find('{')
            end_idx = response_content.rfind('}') + 1
            json_str = response_content[start_idx:end_idx]
            return json.loads(json_str)
        except Exception as e:
            print(f"Harmony Check Error: {e}")
            return {
                "status": "YELLOW",
                "summary": "AI Analysis partially failed. Please consult a doctor.",
                "warnings": [str(e)],
                "recommendations": "Verify with a medical professional manually."
            }

    async def analyze_prescription(self, medication: str, dosage: str, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cross-references a single prescription against the user's detailed profile using GPT-4o.
        """
        prompt = f"""
        Analyze this new prescription for suitability based on the patient's profile.
        
        Patient Profile:
        - Height: {user_profile.get('height_cm')} cm
        - Weight: {user_profile.get('weight_kg')} kg
        - Allergies: {user_profile.get('allergies')}
        - Dietary Restrictions: {user_profile.get('dietary_restrictions')}
        
        New Prescription:
        - Medication: {medication}
        - Dosage: {dosage}
        
        Instructions:
        1. Verify if the medication conflicts with the patient's allergies or dietary restrictions.
        2. Assess if the dosage is safe and effective based on the patient's weight and height.
        3. Provide a JSON validation status: "Safe", "Warning", or "Danger".
        4. Return ONLY a JSON object with: "status", "analysis", "concerns" (list), "verdict".
        
        Return ONLY a clean JSON object.
        """
        
        try:
            response_content = await openrouter_service.chat_health_companion(
                [{"role": "user", "content": prompt}],
                user_profile=user_profile
            )
            start_idx = response_content.find('{')
            end_idx = response_content.rfind('}') + 1
            json_str = response_content[start_idx:end_idx]
            return json.loads(json_str)
        except Exception as e:
            print(f"Prescription Analysis Error: {e}")
            return {
                "status": "Warning",
                "analysis": "AI Analysis failed to process correctly.",
                "concerns": ["Internal processing error"],
                "verdict": "Manual verification required."
            }

analysis_service = AnalysisService()
