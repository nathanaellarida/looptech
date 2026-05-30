# LoopTech

An educational coding platform: a React 19 + Vite single-page app with a FastAPI
emotion-detection service and a WebSocket signaling relay for collaborative
coding.

> **Status:** demo / educational. Authentication is **simulated** (see
> [SECURITY.md](SECURITY.md)). Do not treat this as production-secure until real
> authentication and authenticated room membership are implemented.

## Architecture

| Part | Path | Port (dev) |
| --- | --- | --- |
| Frontend (React + Vite) | `src/`, `public/` | 5173 |
| Chat + emotion API (FastAPI) | `python-server/` | 8000 |
| WebRTC signaling relay (ws) | `js-server/` | 5174 |

The chatbot (`public/chatbot.html`) calls the **same-origin** `/api/chat`
endpoint. The browser never holds an API key — the key lives only in the server
environment and the FastAPI service proxies the call to Google.

## Requirements

- **Node.js 20.19+** (see `.nvmrc` / `engines`).
- **Python 3.10** (see `python-server/runtime.txt`).

## Setup

### 1. Configure environment variables

```bash
cp .env.example .env        # then edit .env
```

`.env` is git-ignored. **Never commit a real key.** At minimum set
`GEMINI_API_KEY` (server-side only). See `.env.example` for all options
(host/port, allowed origins, signaling URLs).

The FastAPI server reads its environment from the process. Export the variables
(or use a tool such as `python-dotenv` / your shell) before starting it, e.g.:

```bash
# macOS/Linux
export GEMINI_API_KEY=...        # your server-side key
# Windows PowerShell
$env:GEMINI_API_KEY = "..."
```

If `GEMINI_API_KEY` is absent, `/api/chat` returns a safe `503` and the chatbot
shows a friendly "not configured" message.

### 2. Install dependencies

```bash
npm install
python -m pip install -r python-server/requirements.txt
```

### 3. Run everything (dev)

```bash
npm run dev
```

This starts the FastAPI server (with `--reload`), the signaling server, and Vite
concurrently. Vite proxies `/api` and `/detect_emotion` to `localhost:8000` in
development; in production the app is served same-origin behind a reverse proxy.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run frontend + both servers concurrently |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm test` | Frontend unit tests (Vitest) |

Backend tests:

```bash
pip install -r python-server/requirements-dev.txt
pytest python-server/tests -q
```

## Security

- No secrets in the frontend, `public/`, Vite config, tests, or `VITE_*` vars.
- Code the "Run" button executes goes through a shared, sandboxed
  iframe/Web-Worker runner (`src/challenges/sandboxRunner.js`) — no access to the
  app DOM, storage, or network; infinite loops are terminated.
- CI runs lint/tests/build, `npm audit`, `pip-audit`, and a Gitleaks secret scan
  (`.github/workflows/`). Dependabot is configured for npm and pip.
- See [SECURITY.md](SECURITY.md) for reporting, recommended GitHub settings, and
  residual risks, and [docs/collaboration-security.md](docs/collaboration-security.md)
  for collaboration/media notes.

## License

Educational use.
