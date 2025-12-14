try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False

import cv2
import numpy as np
from typing import List, Dict, Optional
import os

class DentalPathologyModel:
    def __init__(self, model_path: str):
        if not YOLO_AVAILABLE:
            raise ImportError("ultralytics package is not installed. Install with: pip install ultralytics")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        self.model = YOLO(model_path)
        self.class_names = {
            0: "Abrasion",
            1: "Filling",
            2: "Crown",
            3: "Caries Class 1",
            4: "Caries Class 2",
            5: "Caries Class 3",
            6: "Caries Class 4",
            7: "Caries Class 5",
            8: "Caries Class 6"
        }
    
    def predict(self, image_path: str, conf_threshold: float = 0.25, iou_threshold: float = 0.45) -> List[Dict]:
        try:
            results = self.model(
                image_path,
                conf=conf_threshold,
                iou=iou_threshold,
                task="segment"
            )
            
            if not results or len(results) == 0:
                return []
            
            return self._format_results(results[0])
        except Exception as e:
            print(f"Error during prediction: {e}")
            return []
    
    def _format_results(self, result) -> List[Dict]:
        predictions = []
        
        if result is None:
            return predictions
        
        orig_h, orig_w = result.orig_shape[:2] if hasattr(result, 'orig_shape') else (640, 640)
        
        if result.masks is not None and len(result.masks.data) > 0:
            boxes = result.boxes
            masks = result.masks
            
            num_detections = len(boxes) if boxes is not None else 0
            
            for i in range(num_detections):
                try:
                    cls = int(boxes.cls[i].item())
                    conf = float(boxes.conf[i].item())
                    mask = masks.data[i].cpu().numpy()
                    
                    if len(mask.shape) == 2:
                        mask_h, mask_w = mask.shape
                        if mask_h != orig_h or mask_w != orig_w:
                            mask = cv2.resize(mask, (orig_w, orig_h), interpolation=cv2.INTER_NEAREST)
                    
                    polygon = self._mask_to_polygon(mask, (orig_h, orig_w))
                    bbox = self._extract_bbox(boxes.xyxy[i].cpu().numpy(), (orig_h, orig_w))
                    
                    if polygon and len(polygon) >= 6:
                        predictions.append({
                            "class_id": cls,
                            "class_name": self.class_names.get(cls, f"Class {cls}"),
                            "confidence": round(conf, 6),
                            "polygon": polygon,
                            "bbox": bbox
                        })
                except Exception as e:
                    print(f"Error processing detection {i}: {e}")
                    continue
                    
        elif result.boxes is not None and len(result.boxes) > 0:
            boxes = result.boxes
            
            for i in range(len(boxes)):
                try:
                    cls = int(boxes.cls[i].item())
                    conf = float(boxes.conf[i].item())
                    bbox = self._extract_bbox(boxes.xyxy[i].cpu().numpy(), (orig_h, orig_w))
                    
                    x1, y1, x2, y2 = boxes.xyxy[i].cpu().numpy()
                    polygon = [
                        float(x1 / orig_w), float(y1 / orig_h),
                        float(x2 / orig_w), float(y1 / orig_h),
                        float(x2 / orig_w), float(y2 / orig_h),
                        float(x1 / orig_w), float(y2 / orig_h)
                    ]
                    
                    predictions.append({
                        "class_id": cls,
                        "class_name": self.class_names.get(cls, f"Class {cls}"),
                        "confidence": round(conf, 6),
                        "polygon": polygon,
                        "bbox": bbox
                    })
                except Exception as e:
                    print(f"Error processing box {i}: {e}")
                    continue
        
        return predictions
    
    def _mask_to_polygon(self, mask: np.ndarray, orig_shape: tuple) -> List[float]:
        import sys
        import os
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)
        from utils.polygon_utils import mask_to_normalized_polygon
        
        h, w = orig_shape[:2]
        
        if mask.shape[:2] != (h, w):
            mask = cv2.resize(mask, (w, h), interpolation=cv2.INTER_NEAREST)
        
        polygon = mask_to_normalized_polygon(mask)
        
        if not polygon or len(polygon) < 6:
            return []
        
        return polygon
    
    def _extract_bbox(self, box: np.ndarray, orig_shape: tuple) -> Dict:
        h, w = orig_shape[:2]
        
        x1, y1, x2, y2 = box
        
        return {
            "x": float(x1 / w),
            "y": float(y1 / h),
            "w": float((x2 - x1) / w),
            "h": float((y2 - y1) / h)
        }

