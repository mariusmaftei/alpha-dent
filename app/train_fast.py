"""
Fast Training Script - Optimized for Speed

This version uses smaller settings for faster training while still getting good results.
Use this if you want to test quickly or don't have time for full 500 epochs.
"""

from ultralytics import YOLO
import torch
import os

# ============================================================================
# FAST CONFIGURATION - Optimized for speed
# ============================================================================

# Use 'l' (large) instead of 'x' (extra large) - much faster, still accurate
MODEL_SIZE = 'l'

# Use 640px instead of 1280px - 4x faster, still good accuracy
IMAGE_SIZE = 640

# Fewer epochs - train for 100 epochs first, then continue if needed
EPOCHS = 100

# Larger batch size - faster training
BATCH_SIZE = 16

# Data configuration file
DATA_YAML = 'C:/Users/Marius Maftei/Desktop/Development/alpha-dent/AlphaDent/yolo_seg_train.yaml'

# Project name
PROJECT_NAME = 'runs/segment'
RUN_NAME = f'alphadent_{MODEL_SIZE}_{IMAGE_SIZE}_fast'

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
    print("  AlphaDent YOLO Training - FAST Configuration")
    print("=" * 70)
    print(f"\nConfiguration:")
    print(f"  Model: YOLOv8{MODEL_SIZE}-seg (faster than 'x')")
    print(f"  Image Size: {IMAGE_SIZE}px (4x faster than 1280px)")
    print(f"  Epochs: {EPOCHS} (can continue later)")
    print(f"  Batch Size: {BATCH_SIZE}")
    print(f"  Data Config: {DATA_YAML}")
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
            patience=30,  # Early stopping - stops if no improvement for 30 epochs
            batch=BATCH_SIZE,
            imgsz=IMAGE_SIZE,
            device=device,
            optimizer='AdamW',
            lr0=0.001,
            lrf=0.01,
            momentum=0.937,
            weight_decay=0.0005,
            
            # Data augmentation
            hsv_h=0.015,
            hsv_s=0.7,
            hsv_v=0.4,
            degrees=10,
            translate=0.1,
            scale=0.5,
            shear=2,
            perspective=0.0001,
            flipud=0.0,
            fliplr=0.5,
            mosaic=1.0,
            mixup=0.1,
            copy_paste=0.1,
            
            # Loss weights
            box=7.5,
            cls=0.5,
            dfl=1.5,
            
            # Training options
            amp=True,
            fraction=1.0,
            profile=False,
            freeze=None,
            multi_scale=False,
            overlap_mask=True,
            mask_ratio=4,
            dropout=0.0,
            
            # Validation
            val=True,
            split='val',
            
            # Saving
            save=True,
            save_period=10,
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
        
        print("\n" + "=" * 70)
        print("💡 Tip: If results are good, you can use this model!")
        print("   If you want better accuracy, continue training with more epochs.")
        print("=" * 70)
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Training interrupted by user")
        print("   Progress saved. Resume with: resume=True")
    except Exception as e:
        print(f"\n❌ Training failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    train_model()

