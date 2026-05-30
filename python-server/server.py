# server.py
import os
import time
import argparse
import logging
from collections import defaultdict, deque
from functools import lru_cache

import httpx
import numpy as np
import cv2
import pathlib
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field

logger = logging.getLogger("looptech.server")

app = FastAPI()


# ---------------------------------------------------------------------------
# Configuration (all from the environment; safe, non-secret defaults)
# ---------------------------------------------------------------------------
def _parse_origins(raw: str) -> list[str]:
    return [o.strip() for o in raw.split(",") if o.strip()]


HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8000"))
ALLOWED_ORIGINS = _parse_origins(os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173"))

# CORS: exact-match allowlist, no credentials, only what the app uses.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

BASE_DIR = pathlib.Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model_file_30epochs.h5"
CASCADE_PATH = BASE_DIR / "haarcascade_frontalface_default.xml"

labels_dict = {
    0: 'Angry',
    1: 'Disgust',
    2: 'Fear',
    3: 'Happy',
    4: 'Neutral',
    5: 'Sad',
    6: 'Surprise',
}

# Upload limits (enforced before any expensive decoding/inference).
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_UPLOAD_BYTES = 3 * 1024 * 1024          # 3 MiB
MAX_IMAGE_PIXELS = 4_000_000                # ~4 MP, guards decompression bombs
MAX_IMAGE_DIM = 4096


@lru_cache(maxsize=1)
def get_model():
    # Imported/loaded lazily so the module imports without the heavy
    # TensorFlow/Keras runtime (and so unit tests can stub it out).
    from keras.models import load_model
    return load_model(str(MODEL_PATH))


@lru_cache(maxsize=1)
def get_face_detector():
    return cv2.CascadeClassifier(str(CASCADE_PATH))


# ---------------------------------------------------------------------------
# Minimal in-memory rate limiter
#
# NOTE: this is per-process only. With multiple Uvicorn/Gunicorn workers each
# worker has its own counters, so production behind multiple workers must use a
# shared limiter (e.g. Redis) or an API gateway / reverse-proxy rate limit.
# ---------------------------------------------------------------------------
class SlidingWindowLimiter:
    def __init__(self, max_requests: int, window_seconds: float):
        self.max_requests = max_requests
        self.window = window_seconds
        self._hits: dict[str, deque] = defaultdict(deque)

    def allow(self, key: str, now: float | None = None) -> bool:
        now = time.monotonic() if now is None else now
        q = self._hits[key]
        cutoff = now - self.window
        while q and q[0] < cutoff:
            q.popleft()
        if len(q) >= self.max_requests:
            return False
        q.append(now)
        return True


chat_limiter = SlidingWindowLimiter(max_requests=20, window_seconds=60.0)


# ---------------------------------------------------------------------------
# Server-side Gemini proxy (browser never sees a key)
# ---------------------------------------------------------------------------
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models"
MAX_PROMPT_CHARS = 4000
MAX_UPSTREAM_BYTES = 256 * 1024


class ChatRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=MAX_PROMPT_CHARS)


class ChatResponse(BaseModel):
    reply: str


def _client_key(request: Request) -> str:
    return request.client.host if request.client else "unknown"


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, request: Request):
    if not chat_limiter.allow(_client_key(request)):
        raise HTTPException(status_code=429, detail="Too many requests. Please slow down.")

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="Chat assistant is not configured.")

    prompt = req.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=422, detail="Prompt must not be empty.")

    url = f"{GEMINI_ENDPOINT}/{GEMINI_MODEL}:generateContent"
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                url,
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": api_key,  # documented header, never the URL
                },
                json={"contents": [{"parts": [{"text": prompt}]}]},
            )
    except httpx.HTTPError:
        logger.warning("Upstream chat request failed")  # no bodies, no key
        raise HTTPException(status_code=502, detail="Upstream request failed.")

    if resp.status_code != 200:
        logger.warning("Upstream chat returned status %s", resp.status_code)
        raise HTTPException(status_code=502, detail="Upstream request failed.")

    body = resp.content[:MAX_UPSTREAM_BYTES]
    try:
        data = httpx.Response(200, content=body).json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Invalid upstream response.")

    try:
        reply = data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        reply = "Sorry, I couldn't generate a response."

    return ChatResponse(reply=str(reply)[:MAX_PROMPT_CHARS])


# ---------------------------------------------------------------------------
# Emotion detection
# ---------------------------------------------------------------------------
def _run_inference(gray_face) -> str:
    resized = cv2.resize(gray_face, (48, 48))
    normalize = resized / 255.0
    reshaped = np.reshape(normalize, (1, 48, 48, 1))
    result = get_model().predict(reshaped, verbose=0)
    label = int(np.argmax(result, axis=1)[0])
    return labels_dict.get(label)


@app.post("/detect_emotion")
async def detect_emotion(request: Request, file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported image type.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty upload.")
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image too large.")

    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid or unreadable image.")

    h, w = frame.shape[:2]
    if h > MAX_IMAGE_DIM or w > MAX_IMAGE_DIM or (h * w) > MAX_IMAGE_PIXELS:
        raise HTTPException(status_code=413, detail="Image dimensions too large.")

    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = get_face_detector().detectMultiScale(gray, 1.3, 3)
        emotion_label = None
        if len(faces) > 0:
            x, y, fw, fh = faces[0]
            sub_face_img = gray[y:y + fh, x:x + fw]
            # Blocking OpenCV/TensorFlow work runs off the event loop.
            emotion_label = await run_in_threadpool(_run_inference, sub_face_img)
    except HTTPException:
        raise
    except Exception:
        logger.exception("Emotion detection failed")  # full detail to logs only
        raise HTTPException(status_code=500, detail="Could not process image.")

    return {"emotion": emotion_label}


# ---------------------------------------------------------------------------
# Health / readiness (reveal no secrets)
# ---------------------------------------------------------------------------
@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.get("/readyz")
async def readyz():
    return {"status": "ready", "model_present": MODEL_PATH.exists()}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LoopTech emotion/chat server")
    parser.add_argument(
        "--reload",
        action="store_true",
        default=os.environ.get("RELOAD", "").lower() in ("1", "true", "yes"),
        help="Enable auto-reload (development only).",
    )
    args = parser.parse_args()
    import uvicorn
    # Default: bind loopback, reload disabled. Dev script passes --reload.
    uvicorn.run("server:app", host=HOST, port=PORT, reload=args.reload)
