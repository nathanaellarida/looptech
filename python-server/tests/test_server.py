"""Backend security tests for the FastAPI service."""
import numpy as np
from fastapi.testclient import TestClient


def client(srv):
    return TestClient(srv.app)


# --------------------------------------------------------------------------
# /api/chat proxy
# --------------------------------------------------------------------------
def test_chat_returns_503_when_key_absent(srv, monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    r = client(srv).post("/api/chat", json={"prompt": "hi"})
    assert r.status_code == 503
    assert "key" not in r.text.lower()  # no secret / key hints leaked


def test_chat_rejects_empty_prompt(srv, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "x")  # value never asserted / echoed
    r = client(srv).post("/api/chat", json={"prompt": ""})
    assert r.status_code == 422


def test_chat_rejects_overlong_prompt(srv, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "x")
    r = client(srv).post("/api/chat", json={"prompt": "a" * (srv.MAX_PROMPT_CHARS + 1)})
    assert r.status_code == 422


def test_chat_success_returns_only_reply(srv, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "x")

    class FakeResp:
        status_code = 200
        content = (
            b'{"candidates":[{"content":{"parts":[{"text":"hello there"}]}}]}'
        )

    class FakeClient:
        def __init__(self, *a, **k):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *a):
            return False

        async def post(self, *a, **k):
            return FakeResp()

    monkeypatch.setattr(srv.httpx, "AsyncClient", FakeClient)
    r = client(srv).post("/api/chat", json={"prompt": "hi"})
    assert r.status_code == 200
    assert r.json() == {"reply": "hello there"}


def test_chat_rate_limited(srv, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "x")
    srv.chat_limiter = srv.SlidingWindowLimiter(max_requests=2, window_seconds=60.0)

    class FakeResp:
        status_code = 200
        content = b'{"candidates":[{"content":{"parts":[{"text":"ok"}]}}]}'

    class FakeClient:
        def __init__(self, *a, **k):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *a):
            return False

        async def post(self, *a, **k):
            return FakeResp()

    monkeypatch.setattr(srv.httpx, "AsyncClient", FakeClient)
    c = client(srv)
    assert c.post("/api/chat", json={"prompt": "hi"}).status_code == 200
    assert c.post("/api/chat", json={"prompt": "hi"}).status_code == 200
    assert c.post("/api/chat", json={"prompt": "hi"}).status_code == 429


def test_chat_upstream_error_is_masked(srv, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "x")

    class FakeResp:
        status_code = 500
        content = b"internal upstream detail that must not leak"

    class FakeClient:
        def __init__(self, *a, **k):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *a):
            return False

        async def post(self, *a, **k):
            return FakeResp()

    monkeypatch.setattr(srv.httpx, "AsyncClient", FakeClient)
    r = client(srv).post("/api/chat", json={"prompt": "hi"})
    assert r.status_code == 502
    assert "internal upstream detail" not in r.text


# --------------------------------------------------------------------------
# /detect_emotion upload hardening
# --------------------------------------------------------------------------
def test_detect_rejects_wrong_content_type(srv):
    r = client(srv).post(
        "/detect_emotion",
        files={"file": ("f.txt", b"not an image", "text/plain")},
    )
    assert r.status_code == 415


def test_detect_rejects_empty_upload(srv):
    r = client(srv).post(
        "/detect_emotion",
        files={"file": ("f.jpg", b"", "image/jpeg")},
    )
    assert r.status_code == 400


def test_detect_rejects_oversized_upload(srv):
    big = b"\x00" * (srv.MAX_UPLOAD_BYTES + 1)
    r = client(srv).post(
        "/detect_emotion",
        files={"file": ("f.jpg", big, "image/jpeg")},
    )
    assert r.status_code == 413


def test_detect_rejects_invalid_image(srv, monkeypatch):
    monkeypatch.setattr(srv.cv2, "imdecode", lambda buf, flags: None)
    r = client(srv).post(
        "/detect_emotion",
        files={"file": ("f.jpg", b"\xff\xd8\xff not-really", "image/jpeg")},
    )
    assert r.status_code == 400


def test_detect_rejects_oversized_dimensions(srv, monkeypatch):
    class FakeFrame:
        shape = (5000, 5000, 3)

    monkeypatch.setattr(srv.cv2, "imdecode", lambda buf, flags: FakeFrame())
    r = client(srv).post(
        "/detect_emotion",
        files={"file": ("f.jpg", b"\xff\xd8\xff data", "image/jpeg")},
    )
    assert r.status_code == 413


def test_detect_no_face_returns_null(srv, monkeypatch):
    monkeypatch.setattr(srv.cv2, "imdecode", lambda buf, flags: np.zeros((32, 32, 3), np.uint8))

    class NoFaces:
        def detectMultiScale(self, *a, **k):
            return np.empty((0, 4), dtype=int)

    monkeypatch.setattr(srv, "get_face_detector", lambda: NoFaces())
    r = client(srv).post(
        "/detect_emotion",
        files={"file": ("f.jpg", b"\xff\xd8\xff data", "image/jpeg")},
    )
    assert r.status_code == 200
    assert r.json() == {"emotion": None}


def test_detect_valid_image_returns_emotion(srv, monkeypatch):
    monkeypatch.setattr(srv.cv2, "imdecode", lambda buf, flags: np.zeros((32, 32, 3), np.uint8))
    monkeypatch.setattr(srv.cv2, "cvtColor", lambda frame, code: np.zeros((32, 32), np.uint8))
    monkeypatch.setattr(srv.cv2, "resize", lambda img, size: np.zeros(size, np.uint8))

    class OneFace:
        def detectMultiScale(self, *a, **k):
            return np.array([[0, 0, 16, 16]])

    class FakeModel:
        def predict(self, arr, verbose=0):
            return np.array([[0, 0, 0, 1, 0, 0, 0]])  # argmax -> 3 -> Happy

    monkeypatch.setattr(srv, "get_face_detector", lambda: OneFace())
    monkeypatch.setattr(srv, "get_model", lambda: FakeModel())
    r = client(srv).post(
        "/detect_emotion",
        files={"file": ("f.jpg", b"\xff\xd8\xff data", "image/jpeg")},
    )
    assert r.status_code == 200
    assert r.json() == {"emotion": "Happy"}


# --------------------------------------------------------------------------
# health / readiness
# --------------------------------------------------------------------------
def test_healthz(srv):
    r = client(srv).get("/healthz")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_readyz(srv):
    r = client(srv).get("/readyz")
    assert r.status_code == 200
    assert r.json()["status"] == "ready"
