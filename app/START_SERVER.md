# How to Start the Server

## Important: Always Activate Virtual Environment First!

The error happens because you're running Python without the virtual environment activated.

## Method 1: Using PowerShell (Recommended)

```powershell
# Navigate to app directory
cd "C:\Users\Marius Maftei\Desktop\Development\alpha-dent\app"

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Now run the server
python main.py
```

## Method 2: Using Batch File

Just double-click:
- `start_server.bat` (Windows)

Or run:
```powershell
.\start_server.bat
```

## Method 3: One-Line Command

```powershell
cd "C:\Users\Marius Maftei\Desktop\Development\alpha-dent\app"; .\venv\Scripts\Activate.ps1; python main.py
```

## Verify Virtual Environment is Active

You should see `(venv)` in your terminal prompt:
```
(venv) PS C:\Users\Marius Maftei\Desktop\Development\alpha-dent\app>
```

## If You Still Get Errors

1. **Make sure venv is activated** - Check for `(venv)` in prompt
2. **Reinstall dependencies**:
   ```powershell
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
3. **Check Python version**:
   ```powershell
   python --version  # Should be 3.12
   ```

## Quick Start Script

I've updated `start_server.bat` to handle this automatically. Just run:
```powershell
.\start_server.bat
```

This will activate the venv and start the server for you!


