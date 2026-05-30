"""Test fixtures for the FastAPI service.

The heavy OpenCV / Keras / TensorFlow runtime is stubbed in sys.modules BEFORE
importing ``server`` so the suite runs anywhere. Individual tests override the
relevant functions (imdecode, the face detector, the model) as needed.
"""
import sys
import types
import pathlib

import numpy as np
import pytest

SERVER_DIR = pathlib.Path(__file__).resolve().parent.parent
if str(SERVER_DIR) not in sys.path:
    sys.path.insert(0, str(SERVER_DIR))


def _install_cv2_stub():
    cv2 = types.ModuleType("cv2")
    cv2.IMREAD_COLOR = 1
    cv2.COLOR_BGR2GRAY = 6

    def _imdecode(buf, flags):  # overridden per-test
        return np.zeros((16, 16, 3), dtype=np.uint8)

    def _cvtColor(frame, code):
        return np.zeros(frame.shape[:2], dtype=np.uint8)

    def _resize(img, size):
        return np.zeros(size, dtype=np.uint8)

    class _Cascade:
        def __init__(self, *a, **k):
            pass

        def detectMultiScale(self, *a, **k):
            return np.empty((0, 4), dtype=int)

    cv2.imdecode = _imdecode
    cv2.cvtColor = _cvtColor
    cv2.resize = _resize
    cv2.CascadeClassifier = _Cascade
    sys.modules["cv2"] = cv2


def _install_ml_stubs():
    keras = types.ModuleType("keras")
    keras_models = types.ModuleType("keras.models")
    keras_models.load_model = lambda *a, **k: None
    keras.models = keras_models
    sys.modules["keras"] = keras
    sys.modules["keras.models"] = keras_models
    sys.modules.setdefault("tensorflow", types.ModuleType("tensorflow"))


_install_cv2_stub()
_install_ml_stubs()

import server  # noqa: E402


@pytest.fixture()
def srv():
    return server


@pytest.fixture(autouse=True)
def _reset_rate_limiter():
    # Fresh limiter per test so unrelated tests don't exhaust the window.
    server.chat_limiter = server.SlidingWindowLimiter(max_requests=20, window_seconds=60.0)
    yield
