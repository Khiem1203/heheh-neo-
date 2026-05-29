import httpx
from typing import List, Dict, Any

class OpenFDAService:
    def __init__(self):
        self.base_url = "https://api.fda.gov/drug/label.json"

    async def check_interactions(self, drug_names: List[str]) -> Dict[str, Any]:
        """
        Queries OpenFDA for drug interaction information.
        Note: This is a simplified logic. Real interaction checking 
        requires complex query mapping in OpenFDA.
        """
        results = []
        async with httpx.AsyncClient() as client:
            for drug in drug_names:
                try:
                    # Query for drug warnings and adverse reactions
                    params = {
                        "search": f'openfda.brand_name:"{drug}" OR openfda.generic_name:"{drug}"',
                        "limit": 1
                    }
                    response = await client.get(self.base_url, params=params)
                    if response.status_code == 200:
                        data = response.json()
                        if "results" in data:
                            label_info = data["results"][0]
                            results.append({
                                "drug": drug,
                                "warnings": label_info.get("warnings", ["No specific warnings found."]),
                                "adverse_reactions": label_info.get("adverse_reactions", []),
                                "drug_interactions": label_info.get("drug_interactions", [])
                            })
                except Exception as e:
                    print(f"Error fetching data for {drug}: {e}")
        
        return {"interactions": results}

open_fda_service = OpenFDAService()
