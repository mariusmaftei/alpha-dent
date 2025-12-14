"""
Training Setup Helper Script

This script helps you set up your dataset and configuration for training.
Run this before starting training to ensure everything is ready.
"""

import os
from pathlib import Path
import yaml

def check_dataset_structure(dataset_path):
    """Check if dataset is organized correctly"""
    print("\n" + "="*70)
    print("  Checking Dataset Structure")
    print("="*70 + "\n")
    
    dataset = Path(dataset_path)
    
    if not dataset.exists():
        print(f"❌ Dataset directory not found: {dataset_path}")
        return False
    
    print(f"✅ Dataset directory found: {dataset_path}\n")
    
    # Check required directories
    required_dirs = {
        'images/train': 'Training images',
        'images/valid': 'Validation images',
        'labels/train': 'Training labels',
        'labels/valid': 'Validation labels',
    }
    
    all_good = True
    for dir_path, description in required_dirs.items():
        full_path = dataset / dir_path
        if full_path.exists():
            # Count files
            if 'images' in dir_path:
                files = list(full_path.glob('*.jpg')) + list(full_path.glob('*.png'))
            else:
                files = list(full_path.glob('*.txt'))
            
            print(f"✅ {description:20} {dir_path:20} ({len(files)} files)")
        else:
            print(f"❌ {description:20} {dir_path:20} (NOT FOUND)")
            all_good = False
    
    return all_good

def create_data_yaml(dataset_path, output_file='data.yaml'):
    """Create data.yaml configuration file"""
    print("\n" + "="*70)
    print("  Creating data.yaml Configuration")
    print("="*70 + "\n")
    
    # Convert to absolute path
    abs_path = os.path.abspath(dataset_path)
    
    config = {
        'path': abs_path,
        'train': 'images/train',
        'val': 'images/valid',
        'test': 'images/test',
        'nc': 9,
        'names': {
            0: 'Abrasion',
            1: 'Filling',
            2: 'Crown',
            3: 'Caries Class 1',
            4: 'Caries Class 2',
            5: 'Caries Class 3',
            6: 'Caries Class 4',
            7: 'Caries Class 5',
            8: 'Caries Class 6',
        }
    }
    
    # Write to file
    with open(output_file, 'w') as f:
        yaml.dump(config, f, default_flow_style=False, sort_keys=False)
    
    print(f"✅ Created {output_file}")
    print(f"\nConfiguration:")
    print(f"  Dataset path: {abs_path}")
    print(f"  Training: images/train")
    print(f"  Validation: images/valid")
    print(f"  Classes: 9")
    print()
    
    return True

def main():
    """Main setup function"""
    print("\n" + "="*70)
    print("  AlphaDent Training Setup")
    print("="*70)
    
    # Get dataset path
    print("\n📁 Where is your dataset located?")
    print("   (Enter the path to your AlphaDent folder)")
    print("   Example: C:/Users/YourName/Documents/AlphaDent")
    print("   Or: ./AlphaDent (if in current directory)")
    
    dataset_path = input("\nDataset path: ").strip().strip('"').strip("'")
    
    if not dataset_path:
        print("\n❌ No path provided. Exiting.")
        return
    
    # Check dataset structure
    if not check_dataset_structure(dataset_path):
        print("\n⚠️  Dataset structure issues found.")
        print("\nExpected structure:")
        print("  AlphaDent/")
        print("  ├── images/")
        print("  │   ├── train/    # Training images (.jpg)")
        print("  │   ├── valid/    # Validation images (.jpg)")
        print("  │   └── test/     # Test images (.jpg) - optional")
        print("  └── labels/")
        print("      ├── train/    # Training labels (.txt)")
        print("      └── valid/    # Validation labels (.txt)")
        print("\nPlease organize your dataset and try again.")
        return
    
    # Create data.yaml
    print("\n" + "="*70)
    response = input("Create data.yaml configuration file? (y/n): ").strip().lower()
    
    if response == 'y':
        if create_data_yaml(dataset_path):
            print("✅ Configuration file created successfully!")
        else:
            print("❌ Failed to create configuration file")
            return
    else:
        print("⏭️  Skipping data.yaml creation")
        print("   You can create it manually using data.yaml.example")
    
    # Validate dataset
    print("\n" + "="*70)
    response = input("Validate dataset labels? (y/n): ").strip().lower()
    
    if response == 'y':
        print("\n🔍 Running dataset validation...")
        import subprocess
        import sys
        
        train_images = os.path.join(dataset_path, 'images', 'train')
        train_labels = os.path.join(dataset_path, 'labels', 'train')
        
        try:
            result = subprocess.run(
                [sys.executable, 'validate_dataset.py', 
                 '--images', train_images,
                 '--labels', train_labels,
                 '--name', 'Training Dataset'],
                capture_output=True,
                text=True
            )
            print(result.stdout)
            if result.returncode != 0:
                print(result.stderr)
        except Exception as e:
            print(f"⚠️  Could not run validation: {e}")
            print("   You can run it manually: python validate_dataset.py")
    
    # Final instructions
    print("\n" + "="*70)
    print("  ✅ Setup Complete!")
    print("="*70)
    print("\nNext steps:")
    print("  1. Review data.yaml configuration")
    print("  2. Adjust training parameters in train.py if needed")
    print("  3. Start training:")
    print("     python train.py")
    print("\n" + "="*70 + "\n")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup cancelled by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

