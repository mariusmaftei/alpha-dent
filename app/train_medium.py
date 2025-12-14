"""
Medium/Balanced Training Script - Best Balance of Speed and Accuracy

This version uses balanced settings for good accuracy without taking too long.
Recommended for production use - good balance between speed and quality.
"""

from ultralytics import YOLO
import torch
import os

# ============================================================================
# MEDIUM/BALANCED CONFIGURATION - Best balance of speed and accuracy
# ============================================================================

# Use 'l' (large) model - good balance of speed and accuracy
MODEL_SIZE = 'l'

# Use 960px - good balance (better than 640px, faster than 1280px)
IMAGE_SIZE = 960

# Moderate epochs - train for 200 epochs for good results
EPOCHS = 200

# Balanced batch size
BATCH_SIZE = 12

# Data configuration file
DATA_YAML = 'C:/Users/Marius Maftei/Desktop/Development/alpha-dent/AlphaDent/yolo_seg_train.yaml'

# Project name
PROJECT_NAME = 'runs/segment'
RUN_NAME = f'alphadent_{MODEL_SIZE}_{IMAGE_SIZE}_medium'

# ============================================================================
# TRAINING SETUP
# ============================================================================

def check_gpu():
    """Check GPU availability and memory"""
    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3
        print(f"✅ GPU detected: {gpu_name}")
        print(f"   Memory: {gpu_memory:.1f} GB")
        return 0
    else:
        print("⚠️  No GPU detected. Training will be very slow on CPU.")
        return 'cpu'

def train_model():
    """Main training function"""
    
    print("=" * 70)
    print("  AlphaDent YOLO Training - MEDIUM/BALANCED Configuration")
    print("=" * 70)
    print(f"\nConfiguration:")
    print(f"  Model: YOLOv8{MODEL_SIZE}-seg (balanced)")
    print(f"  Image Size: {IMAGE_SIZE}px (good balance)")
    print(f"  Epochs: {EPOCHS} (good for production)")
    print(f"  Batch Size: {BATCH_SIZE}")
    print(f"  Data Config: {DATA_YAML}")
    print(f"\n📊 Expected Performance:")
    print(f"  Training Time: ~12-18 hours on RTX 3080")
    print(f"  Expected Accuracy: mAP@50 ~0.80-0.90 (80-90%)")
    print()
    
    # Check GPU
    device = check_gpu()
    print()
    
    # Load model
    model_name = f'yolov8{MODEL_SIZE}-seg.pt'
    print(f"📦 Loading model: {model_name}")
    try:
        model = YOLO(model_name)
        print("✅ Model loaded successfully")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return
    
    print()
    print("🚀 Starting training...")
    print("=" * 70)
    
    # Train model
    try:
        results = model.train(
            data=DATA_YAML,
            epochs=EPOCHS,
            patience=40,  # Early stopping - stops if no improvement for 40 epochs
            batch=BATCH_SIZE,
            imgsz=IMAGE_SIZE,
            device=device,
            
            # Optimizer (AdamW often better for medical imaging)
            optimizer='AdamW',
            lr0=0.001,  # Initial learning rate
            lrf=0.01,   # Final learning rate (lr0 * lrf)
            momentum=0.937,
            weight_decay=0.0005,
            
            # Data augmentation (optimized for dental images)
            hsv_h=0.015,      # Hue variation
            hsv_s=0.7,        # Saturation
            hsv_v=0.4,        # Value (brightness)
            degrees=10,       # Rotation
            translate=0.1,    # Translation
            scale=0.5,        # Scale
            shear=2,          # Shear
            perspective=0.0001,
            flipud=0.0,       # No vertical flip (teeth orientation matters)
            fliplr=0.5,       # Horizontal flip
            mosaic=1.0,       # Mosaic augmentation
            mixup=0.1,        # MixUp augmentation
            copy_paste=0.1,   # Copy-paste augmentation
            
            # Loss weights
            box=7.5,          # Box loss gain
            cls=0.5,          # Class loss gain
            dfl=1.5,          # DFL loss gain
            
            # Training options
            amp=True,         # Automatic Mixed Precision (faster)
            fraction=1.0,     # Use full dataset
            profile=False,    # Profile speeds
            freeze=None,     # Don't freeze layers
            multi_scale=False,
            overlap_mask=True,
            mask_ratio=4,
            dropout=0.0,
            
            # Validation
            val=True,
            split='val',
            
            # Saving
            save=True,
            save_period=10,   # Save checkpoint every 10 epochs
            project=PROJECT_NAME,
            name=RUN_NAME,
            exist_ok=True,
            
            # Other
            pretrained=True,
            verbose=True,
            seed=42,
            plots=True,
            visualize=False,
        )
        
        print()
        print("=" * 70)
        print("✅ Training completed successfully!")
        print("=" * 70)
        
        # Print results
        print(f"\n📊 Final Metrics:")
        print(f"  Best model saved to: {PROJECT_NAME}/{RUN_NAME}/weights/best.pt")
        
        # Validate final model
        print("\n🔍 Running final validation...")
        metrics = model.val()
        print(f"\n  mAP@50: {metrics.box.map50:.4f} ({metrics.box.map50*100:.2f}%)")
        print(f"  mAP@50-95: {metrics.box.map:.4f} ({metrics.box.map*100:.2f}%)")
        print(f"  Precision: {metrics.box.mp:.4f}")
        print(f"  Recall: {metrics.box.mr:.4f}")
        
        # Export model
        print("\n📦 Exporting model to ONNX format...")
        try:
            model.export(format='onnx', imgsz=IMAGE_SIZE, simplify=True)
            print(f"✅ ONNX model exported: {PROJECT_NAME}/{RUN_NAME}/weights/best.onnx")
        except Exception as e:
            print(f"⚠️  ONNX export failed: {e}")
        
        print("\n" + "=" * 70)
        print("🎉 Training complete! Use this model in your application.")
        print("=" * 70)
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Training interrupted by user")
        print("   Progress saved. Resume with: python resume_training.py")
    except Exception as e:
        print(f"\n❌ Training failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    train_model()

