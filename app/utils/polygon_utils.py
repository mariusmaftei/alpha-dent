import cv2
import numpy as np
from typing import List

def mask_to_normalized_polygon(mask: np.ndarray, simplify: bool = True) -> List[float]:
    mask_binary = (mask > 0.5).astype(np.uint8) * 255
    
    contours, _ = cv2.findContours(
        mask_binary,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )
    
    if len(contours) == 0:
        return []
    
    largest_contour = max(contours, key=cv2.contourArea)
    
    if simplify:
        epsilon = 0.002 * cv2.arcLength(largest_contour, True)
        largest_contour = cv2.approxPolyDP(largest_contour, epsilon, True)
    
    h, w = mask.shape[:2]
    
    polygon = []
    for point in largest_contour:
        x = float(point[0][0] / w)
        y = float(point[0][1] / h)
        polygon.extend([x, y])
    
    return polygon

def polygon_to_absolute(polygon: List[float], width: int, height: int) -> List[tuple]:
    absolute_points = []
    for i in range(0, len(polygon), 2):
        x = int(polygon[i] * width)
        y = int(polygon[i + 1] * height)
        absolute_points.append((x, y))
    return absolute_points

def normalize_polygon(polygon: List[tuple], width: int, height: int) -> List[float]:
    normalized = []
    for x, y in polygon:
        normalized.extend([x / width, y / height])
    return normalized

