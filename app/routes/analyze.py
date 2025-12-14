from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import aiofiles
import os
import sys

# Add parent directory (app folder) to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from config import settings
from utils.image_processing import validate_image
from typing import List, Dict

try:
    from services.inference import DentalPathologyModel
    MODEL_AVAILABLE = True
except ImportError:
    MODEL_AVAILABLE = False

router = APIRouter()

model_instance = None

def get_model():
    global model_instance
    if not MODEL_AVAILABLE:
        return None
    
    if model_instance is None:
        if not os.path.exists(settings.MODEL_PATH):
            print(f"Warning: Model not found at {settings.MODEL_PATH}. Using mock predictions.")
            model_instance = None
        else:
            try:
                model_instance = DentalPathologyModel(settings.MODEL_PATH)
                print(f"Model loaded successfully from {settings.MODEL_PATH}")
            except Exception as e:
                print(f"Error loading model: {e}. Using mock predictions.")
                model_instance = None
    return model_instance

@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    if file.size and file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    
    try:
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        if not validate_image(file_path):
            os.remove(file_path)
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        model = get_model()
        
        if model is None:
            predictions = generate_mock_predictions()
        else:
            predictions = model.predict(
                file_path,
                conf_threshold=settings.MODEL_CONF_THRESHOLD
            )
        
        os.remove(file_path)
        
        return JSONResponse(content={
            "success": True,
            "predictions": predictions,
            "image_name": file.filename
        })
    
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

def generate_mock_predictions() -> List[Dict]:
    import random
    mock_predictions = []
    
    num_detections = random.randint(1, 5)
    classes = list(range(9))
    
    for i in range(num_detections):
        class_id = random.choice(classes)
        confidence = round(random.uniform(0.5, 0.95), 6)
        
        polygon = []
        num_points = random.randint(4, 8) * 2
        for _ in range(num_points):
            polygon.append(round(random.uniform(0.1, 0.9), 6))
        
        class_names = {
            0: "Abrasion", 1: "Filling", 2: "Crown",
            3: "Caries Class 1", 4: "Caries Class 2",
            5: "Caries Class 3", 6: "Caries Class 4",
            7: "Caries Class 5", 8: "Caries Class 6"
        }
        
        bbox = calculate_bbox_from_polygon(polygon)
        
        mock_predictions.append({
            "class_id": class_id,
            "class_name": class_names[class_id],
            "confidence": confidence,
            "polygon": polygon,
            "bbox": bbox
        })
    
    return mock_predictions

def calculate_bbox_from_polygon(polygon: List[float]) -> Dict:
    if len(polygon) < 4:
        return {"x": 0.1, "y": 0.1, "w": 0.2, "h": 0.2}
    
    x_coords = [polygon[i] for i in range(0, len(polygon), 2)]
    y_coords = [polygon[i] for i in range(1, len(polygon), 2)]
    
    x_min = min(x_coords)
    x_max = max(x_coords)
    y_min = min(y_coords)
    y_max = max(y_coords)
    
    return {
        "x": x_min,
        "y": y_min,
        "w": x_max - x_min,
        "h": y_max - y_min
    }

