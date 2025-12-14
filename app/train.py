"""
YOLO Training Script for AlphaDent Dental Pathology Detection

This script trains a YOLO segmentation model for high-accuracy cavity detection.
Configure the parameters below based on your GPU and dataset size.
"""

from ultralytics import YOLO
import torch
import os

# ============================================================================
# CONFIGURATION - Adjust these based on your setup
# ============================================================================

# Model selection: 'n' (nano), 's' (small), 'm' (medium), 'l' (large), 'x' (extra large)
# Use 'x' for maximum accuracy (requires 16GB+ GPU)
MODEL_SIZE = 'x'

# Image size: 640 (fast), 960 (balanced), 1280 (best accuracy)
# Larger = better accuracy but slower training and more GPU memory
IMAGE_SIZE = 1280

# Training epochs
EPOCHS = 500

# Batch size - adjust based on GPU memory:
# - RTX 3090 (24GB): batch=8 for x model at 1280px
# - RTX 4090 (24GB): batch=8-12 for x model at 1280px
# - A100 (40GB): batch=16+ for x model at 1280px
BATCH_SIZE = 8

# Data configuration file
# Point to your dataset's YAML file (use absolute path for reliability)
DATA_YAML = 'C:/Users/Marius Maftei/Desktop/Development/alpha-dent/AlphaDent/yolo_seg_train.yaml'

# Project name
PROJECT_NAME = 'runs/segment'
RUN_NAME = f'alphadent_{MODEL_SIZE}_{IMAGE_SIZE}'

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

def validate_data_yaml(data_yaml):
    """Check if data.yaml exists"""
    if not os.path.exists(data_yaml):
        print(f"❌ Error: {data_yaml} not found!")
        print("\nCreate data.yaml with this structure:")
        print("""
path: /path/to/AlphaDent
train: images/train
val: images/valid
test: images/test

nc: 9
names:
  0: Abrasion
  1: Filling
  2: Crown
  3: Caries Class 1
  4: Caries Class 2
  5: Caries Class 3
  6: Caries Class 4
  7: Caries Class 5
  8: Caries Class 6
        """)
        return False
    return True

# ============================================================================
# MAIN TRAINING FUNCTION
# ============================================================================

def train_model():
    """Main training function"""
    
    print("=" * 70)
    print("  AlphaDent YOLO Training - High Accuracy Configuration")
    print("=" * 70)
    print(f"\nConfiguration:")
    print(f"  Model: YOLOv8{MODEL_SIZE}-seg")
    print(f"  Image Size: {IMAGE_SIZE}px")
    print(f"  Epochs: {EPOCHS}")
    print(f"  Batch Size: {BATCH_SIZE}")
    print(f"  Data Config: {DATA_YAML}")
    print()
    
    # Check GPU
    device = check_gpu()
    print()
    
    # Validate data config
    if not validate_data_yaml(DATA_YAML):
        return
    
    # Load model
    model_name = f'yolov8{MODEL_SIZE}-seg.pt'
    print(f"📦 Loading model: {model_name}")
    try:
        model = YOLO(model_name)
        print("✅ Model loaded successfully")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print(f"\nThe model will be downloaded automatically on first run.")
        return
    
    print()
    print("🚀 Starting training...")
    print("=" * 70)
    
    # Train model
    try:
        results = model.train(
            # Data
            data=DATA_YAML,
            
            # Training parameters
            epochs=EPOCHS,
            patience=50,  # Early stopping
            batch=BATCH_SIZE,
            imgsz=IMAGE_SIZE,
            
            # Device
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
        print("🎉 All done! Use the best.pt model in your application.")
        print("=" * 70)
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Training interrupted by user")
        print("   Partial results saved. You can resume training with resume=True")
    except Exception as e:
        print(f"\n❌ Training failed: {e}")
        import traceback
        traceback.print_exc()

# ============================================================================
# RUN TRAINING
# ============================================================================

if __name__ == '__main__':
    train_model()

