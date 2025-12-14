import cv2
from PIL import Image
import os

def validate_image(file_path: str) -> bool:
    try:
        img = Image.open(file_path)
        img.verify()
        return True
    except Exception:
        return False

def process_image(file_path: str, target_size: tuple = None) -> str:
    if target_size is None:
        return file_path
    
    img = cv2.imread(file_path)
    if img is None:
        raise ValueError("Could not read image")
    
    processed = cv2.resize(img, target_size, interpolation=cv2.INTER_LINEAR)
    processed_path = file_path.replace(".", "_processed.")
    cv2.imwrite(processed_path, processed)
    
    return processed_path

def get_image_dimensions(file_path: str) -> tuple:
    img = cv2.imread(file_path)
    if img is None:
        raise ValueError("Could not read image")
    return img.shape[:2]

