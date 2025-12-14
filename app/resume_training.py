"""
Resume YOLO training from the last checkpoint.

Automatically detects which training run to resume from:
- Fast training: runs/segment/alphadent_l_640_fast/
- Full training: runs/segment/alphadent_x_1280/
"""

from ultralytics import YOLO
import torch
import os
from pathlib import Path

# Data configuration
DATA_YAML = r"C:\Users\Marius Maftei\Desktop\Development\alpha-dent\AlphaDent\yolo_seg_train.yaml"

# Training run paths to check (in order of priority)
TRAINING_RUNS = [
    "runs/segment/alphadent_l_640_fast/weights/last.pt",   # Fast training
    "runs/segment/alphadent_l_960_medium/weights/last.pt", # Medium training
    "runs/segment/alphadent_x_1280/weights/last.pt",      # Full training
]

# Training configurations for each run
TRAINING_CONFIGS = {
    "alphadent_l_640_fast": {
        "epochs": 100,
        "imgsz": 640,
        "batch": 16,
    },
    "alphadent_l_960_medium": {
        "epochs": 200,
        "imgsz": 960,
        "batch": 12,
    },
    "alphadent_x_1280": {
        "epochs": 500,
        "imgsz": 1280,
        "batch": 8,
    },
}


def find_checkpoint():
    """Find the most recent checkpoint"""
    for checkpoint_path in TRAINING_RUNS:
        if os.path.exists(checkpoint_path):
            return checkpoint_path
    return None


def get_config_from_path(checkpoint_path):
    """Get training config based on checkpoint path"""
    # Extract run name from path
    if "alphadent_l_640_fast" in checkpoint_path:
        return TRAINING_CONFIGS["alphadent_l_640_fast"]
    elif "alphadent_l_960_medium" in checkpoint_path:
        return TRAINING_CONFIGS["alphadent_l_960_medium"]
    elif "alphadent_x_1280" in checkpoint_path:
        return TRAINING_CONFIGS["alphadent_x_1280"]
    else:
        # Default to fast training config
        return TRAINING_CONFIGS["alphadent_l_640_fast"]


def main():
    print("=" * 70)
    print("  Resume YOLO Training")
    print("=" * 70)
    print()
    
    # Find checkpoint
    checkpoint_path = find_checkpoint()
    
    if not checkpoint_path:
        print("❌ No checkpoint found!")
        print("\nAvailable checkpoints to check:")
        for path in TRAINING_RUNS:
            print(f"  - {path}")
        print("\nMake sure training has started at least once.")
        return
    
    print(f"✅ Found checkpoint: {checkpoint_path}")
    
    # Get training config
    config = get_config_from_path(checkpoint_path)
    print(f"\n📋 Training Configuration:")
    print(f"  Epochs: {config['epochs']}")
    print(f"  Image Size: {config['imgsz']}px")
    print(f"  Batch Size: {config['batch']}")
    print()
    
    # Check device
    device = 0 if torch.cuda.is_available() else "cpu"
    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        print(f"✅ GPU detected: {gpu_name}")
    else:
        print("⚠️  No GPU detected. Training will be slow on CPU.")
    print()
    
    # Load checkpoint
    print(f"📦 Loading checkpoint...")
    model = YOLO(checkpoint_path)
    print("✅ Checkpoint loaded successfully")
    print()
    
    # Resume training
    print("🚀 Resuming training...")
    print("=" * 70)
    
    try:
        model.train(
            data=DATA_YAML,
            epochs=config["epochs"],
            imgsz=config["imgsz"],
            batch=config["batch"],
            device=device,
            resume=True,  # Key flag to continue from checkpoint
            optimizer='AdamW',
            lr0=0.001,
            lrf=0.01,
            patience=30,
            save=True,
            save_period=10,
            project='runs/segment',
            name=os.path.basename(os.path.dirname(os.path.dirname(checkpoint_path))),
            exist_ok=True,
            plots=True,
            verbose=True,
        )
        
        print()
        print("=" * 70)
        print("✅ Training resumed and completed successfully!")
        print("=" * 70)
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Training interrupted by user")
        print("   Progress saved. Run this script again to resume.")
    except Exception as e:
        print(f"\n❌ Error resuming training: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()

