from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
import sys

# Add current directory to path for local imports
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from routes import analyze
from config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n" + "="*60)
    print("  AlphaDent Backend Server Started Successfully!")
    print("="*60)
    print(f"  Server running on: http://localhost:{settings.PORT}")
    print(f"  Health check: http://localhost:{settings.PORT}/api/health")
    print(f"  API docs: http://localhost:{settings.PORT}/docs")
    print("="*60 + "\n")
    yield

app = FastAPI(
    title="AlphaDent API",
    description="Dental Pathology Detection API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api", tags=["analysis"])

@app.get("/")
async def root():
    return {
        "service": "AlphaDent API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/api/health",
            "classes": "/api/classes",
            "analyze": "/api/analyze",
            "docs": "/docs"
        }
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "AlphaDent API"}

@app.get("/api/classes")
async def get_classes():
    classes = {
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
    return classes

if __name__ == "__main__":
    print("\n" + "="*60)
    print("  Starting AlphaDent Backend Server...")
    print("="*60)
    print(f"  Port: {settings.PORT}")
    print(f"  Host: {settings.HOST}")
    print(f"  Debug mode: {settings.DEBUG}")
    print("="*60 + "\n")
    
    if settings.DEBUG:
        uvicorn.run(
            "main:app",
            host=settings.HOST,
            port=settings.PORT,
            reload=True
        )
    else:
        uvicorn.run(
            app,
            host=settings.HOST,
            port=settings.PORT,
            reload=False
        )
