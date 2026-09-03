# backend/app.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from utils import preprocess_audio
from model.aasist_inference import AASISTNeuralEngine
import uvicorn

app = FastAPI(
    title="VoiceGuard AASIST AI Voice Detection API",
    description="Backend service converting audio files to AASIST anti-spoofing scores for real-time AI voice cloning defense.",
    version="1.0.0"
)

# CORS setup - allowing React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AASIST Neural Classifier
classifier = AASISTNeuralEngine(weights_path="backend/model/weights/AASIST.pth")

@app.get("/")
def root():
    return {
        "service": "VoiceGuard AASIST Backend",
        "status": "online",
        "model": "AASIST Spectro-Temporal Anti-Spoofing",
        "endpoints": {
            "health": "/api/health",
            "detect": "/api/detect (POST multipart/form-data)"
        }
    }

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "model": "AASIST",
        "sampling_rate": "16000Hz",
        "input_samples": 64600
    }

@app.post("/api/detect")
async def detect_audio(file: UploadFile = File(...)):
    """
    Accepts an uploaded audio file (WAV, MP3, WEBM, OGG, M4A),
    processes it through the AASIST engine, and returns the AASIST score and decision.
    """
    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file payload received.")

        # Preprocess to 16kHz mono 64,600 samples
        pcm_data, duration, orig_sr = preprocess_audio(content)

        # Run AASIST feature evaluation and scoring
        result = classifier.predict(pcm_data, duration)
        result["filename"] = file.filename
        result["duration_seconds"] = round(duration, 2)
        result["original_sample_rate"] = orig_sr

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio processing error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=5000, reload=True)
