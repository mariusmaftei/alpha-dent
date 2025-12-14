# Start Fast Training - Quick Guide

## Steps to Start Fast Training

### Step 1: Stop Current Training
If training is still running:
- Press `Ctrl + C` in the training terminal
- Wait for it to stop

### Step 2: Start Fast Training

```bash
cd "C:\Users\Marius Maftei\Desktop\Development\alpha-dent\app"
.\venv\Scripts\activate
python train_fast.py
```

## What to Expect

### Training Configuration:
- **Model**: YOLOv8l-seg (large, faster than 'x')
- **Image Size**: 640px (4x faster than 1280px)
- **Epochs**: 100 (can continue later if needed)
- **Batch Size**: 16 (faster processing)
- **Estimated Time**: 4-6 hours on RTX 3080

### During Training:
- You'll see progress for each epoch
- Loss values should decrease over time
- Validation metrics every few epochs
- Checkpoints saved every 10 epochs

### After Training:
- Model saved to: `runs/segment/alphadent_l_640_fast/weights/best.pt`
- Final metrics shown (mAP@50, mAP@50-95)
- Ready to test in your React app!

## If Training Stops

To resume:
```bash
python resume_training.py
```
(Update the path in resume_training.py to point to the fast training run)

## Next Steps After Training

1. Update `.env`:
   ```env
   MODEL_PATH=runs/segment/alphadent_l_640_fast/weights/best.pt
   ```

2. Start backend:
   ```bash
   python main.py
   ```

3. Test in React app!

Good luck! 🚀

