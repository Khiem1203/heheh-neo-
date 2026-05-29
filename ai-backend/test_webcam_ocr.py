import requests
import os

# Configuration
BACKEND_URL = "http://localhost:8000/api/v1/ocr/prescription"
TEST_IMAGE_PATH = "test_prescription.jpg" # Ensure this file exists for a real test

def test_ocr_endpoint():
    print(f"Testing OCR endpoint: {BACKEND_URL}")
    
    if not os.path.exists(TEST_IMAGE_PATH):
        print(f"Error: Test image '{TEST_IMAGE_PATH}' not found. Creating a dummy one for logic check...")
        from PIL import Image
        img = Image.new('RGB', (100, 100), color = (73, 109, 137))
        img.save(TEST_IMAGE_PATH)

    try:
        with open(TEST_IMAGE_PATH, 'rb') as f:
            files = {'file': (TEST_IMAGE_PATH, f, 'image/jpeg')}
            response = requests.post(BACKEND_URL, files=files)
            
        if response.status_code == 200:
            print("Success! Response:")
            print(response.json())
        else:
            print(f"Failed with status code: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    test_ocr_endpoint()
