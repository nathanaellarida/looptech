# server.py
import os
from functools import lru_cache

import httpx
import numpy as np
import cv2
import uvicorn
import pathlib
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI()

# Allow frontend access (tightened further in a later change).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@lru_cache(maxsize=1)
def get_model():
    # Imported and loaded lazily so the module can be imported (and unit
    # tested) without the heavy TensorFlow/Keras runtime being present.
    from keras.models import load_model
    return load_model(str(MODEL_PATH))


@lru_cache(maxsize=1)
def get_face_detector():
    return cv2.CascadeClassifier(str(CASCADE_PATH))


# ---------------------------------------------------------------------------
# Server-side Gemini proxy
#
# The browser never sees an API key. The key is read exclusively from the
# server environment. The model is configurable and non-secret.
# ---------------------------------------------------------------------------
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models"
MAX_PROMPT_CHARS = 4000
MAX_UPSTREAM_BYTES = 256 * 1024


class ChatRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=MAX_PROMPT_CHARS)


class ChatResponse(BaseModel):
    reply: str


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Safe, non-leaking 503 when the assistant is not configured.
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
                    # Pass the key via the documented header, never the URL.
                    "x-goog-api-key": api_key,
                },
                json={"contents": [{"parts": [{"text": prompt}]}]},
            )
    except httpx.HTTPError:
        # Do not leak upstream error bodies, URLs, or the key.
        raise HTTPException(status_code=502, detail="Upstream request failed.")

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Upstream request failed.")

    # Bound the parsed response size.
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


@app.post("/detect_emotion")
async def detect_emotion(file: UploadFile = File(...)):
    # Read uploaded image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = get_face_detector().detectMultiScale(gray, 1.3, 3)

    emotion_label = None
    for (x, y, w, h) in faces:
        sub_face_img = gray[y:y + h, x:x + w]
        resized = cv2.resize(sub_face_img, (48, 48))
        normalize = resized / 255.0
        reshaped = np.reshape(normalize, (1, 48, 48, 1))
        result = get_model().predict(reshaped)
        label = np.argmax(result, axis=1)[0]
        emotion_label = labels_dict[label]
        break  # just detect first face

    return {"emotion": emotion_label}


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
