"""
Dataset Validation Script

Validates that your dataset is properly formatted for YOLO training.
Run this before training to catch any issues early.
"""

from pathlib import Path
import cv2
import sys

def validate_dataset(images_dir, labels_dir, dataset_name="Dataset"):
    """Validate dataset structure and labels"""
    print(f"\n{'='*70}")
    print(f"  Validating {dataset_name}")
    print(f"{'='*70}\n")
    
    images_path = Path(images_dir)
    labels_path = Path(labels_dir)
    
    # Check directories exist
    if not images_path.exists():
        print(f"❌ Images directory not found: {images_dir}")
        return False
    
    if not labels_path.exists():
        print(f"❌ Labels directory not found: {labels_dir}")
        return False
    
    print(f"✅ Directories found")
    print(f"   Images: {images_path}")
    print(f"   Labels: {labels_path}\n")
    
    # Find all images
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp']
    image_files = []
    for ext in image_extensions:
        image_files.extend(list(images_path.glob(f"*{ext}")))
        image_files.extend(list(images_path.glob(f"*{ext.upper()}")))
    
    if not image_files:
        print(f"❌ No images found in {images_dir}")
        print(f"   Supported formats: {', '.join(image_extensions)}")
        return False
    
    print(f"📊 Found {len(image_files)} images\n")
    
    # Validate each image-label pair
    issues = []
    valid_count = 0
    total_objects = 0
    
    for img_path in sorted(image_files):
        label_path = labels_path / (img_path.stem + ".txt")
        
        # Check if label exists
        if not label_path.exists():
            issues.append(f"Missing label: {label_path.name}")
            continue
        
        # Check image can be read
        img = cv2.imread(str(img_path))
        if img is None:
            issues.append(f"Invalid/corrupted image: {img_path.name}")
            continue
        
        h, w = img.shape[:2]
        if h == 0 or w == 0:
            issues.append(f"Zero-size image: {img_path.name}")
            continue
        
        # Check labels
        label_valid = True
        objects_in_image = 0
        
        try:
            with open(label_path) as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if not line:
                        continue
                    
                    parts = line.split()
                    if len(parts) < 7:  # class + at least 3 points (6 coords)
                        issues.append(f"{img_path.name}: Line {line_num} - Too few coordinates (need at least 3 points)")
                        label_valid = False
                        continue
                    
                    try:
                        class_id = int(parts[0])
                        if class_id < 0 or class_id > 8:
                            issues.append(f"{img_path.name}: Line {line_num} - Invalid class_id {class_id} (must be 0-8)")
                            label_valid = False
                            continue
                        
                        coords = [float(x) for x in parts[1:]]
                        if len(coords) % 2 != 0:
                            issues.append(f"{img_path.name}: Line {line_num} - Odd number of coordinates")
                            label_valid = False
                            continue
                        
                        if any(c < 0 or c > 1 for c in coords):
                            issues.append(f"{img_path.name}: Line {line_num} - Coordinates out of range [0, 1]")
                            label_valid = False
                            continue
                        
                        # Check polygon has at least 3 points
                        num_points = len(coords) // 2
                        if num_points < 3:
                            issues.append(f"{img_path.name}: Line {line_num} - Polygon needs at least 3 points, got {num_points}")
                            label_valid = False
                            continue
                        
                        objects_in_image += 1
                        
                    except ValueError as e:
                        issues.append(f"{img_path.name}: Line {line_num} - Invalid number format: {e}")
                        label_valid = False
                        continue
        
        except Exception as e:
            issues.append(f"{img_path.name}: Error reading label file: {e}")
            label_valid = False
            continue
        
        if label_valid:
            valid_count += 1
            total_objects += objects_in_image
    
    # Print results
    print(f"📈 Validation Results:")
    print(f"   Total images: {len(image_files)}")
    print(f"   Valid images: {valid_count}")
    print(f"   Total objects: {total_objects}")
    print(f"   Average objects per image: {total_objects/valid_count if valid_count > 0 else 0:.2f}")
    print()
    
    if issues:
        print(f"❌ Found {len(issues)} issues:\n")
        for issue in issues[:20]:  # Show first 20
            print(f"   • {issue}")
        if len(issues) > 20:
            print(f"\n   ... and {len(issues) - 20} more issues")
        print()
        print(f"⚠️  Please fix these issues before training")
        return False
    else:
        print(f"✅ All images and labels are valid!")
        print(f"   Ready for training!")
        return True

def main():
    """Main validation function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Validate YOLO dataset')
    parser.add_argument('--images', type=str, default='images/train',
                       help='Path to images directory')
    parser.add_argument('--labels', type=str, default='labels/train',
                       help='Path to labels directory')
    parser.add_argument('--name', type=str, default='Training Dataset',
                       help='Dataset name for display')
    
    args = parser.parse_args()
    
    success = validate_dataset(args.images, args.labels, args.name)
    
    if success:
        print("\n" + "="*70)
        print("  ✅ Dataset validation PASSED")
        print("  You can now proceed with training!")
        print("="*70 + "\n")
        sys.exit(0)
    else:
        print("\n" + "="*70)
        print("  ❌ Dataset validation FAILED")
        print("  Please fix the issues above before training")
        print("="*70 + "\n")
        sys.exit(1)

if __name__ == '__main__':
    main()

