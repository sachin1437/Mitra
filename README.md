# Mitra 🤍

**Your late-night friend.** A privacy-first AI companion for Indian college students, built for the moments when everything feels heavier and there's no one else to talk to.

Live at [mitra.cybernetic.co.in](https://mitra.cybernetic.co.in)

---

## What Mitra is

Mitra isn't a therapist, a coach, or a productivity bot. It's the friend who picks up at 2am — warm, honest, occasionally in Hinglish, and genuinely present. It listens more than it advises, remembers your conversations, and never turns into a homework-doing assistant.

Built by a solo founder as part of [NetraaLabs](https://netraalabs.netlify.app), currently unregistered as any legal entity.

## Core features

- **Persona-tuned conversation** — casual, warm, anti-therapy-speak system prompt with language progression (English → natural Hinglish blend), anti-repetition rules, and conversational momentum tuning
- **Crisis safety layer** — a deterministic, model-independent phrase/regex net that guarantees a safe, warm, complete reply surfacing Tele-MANAS (14416) the moment real distress is detected — tested against an independent 39-case adversarial set (English, Hindi, Hinglish, indirect/metaphorical/planning-language phrasing) at **93.1% recall, 0% false-positive rate**
- **End-to-end encrypted chat history** — every message is encrypted client-side (AES-256-GCM) before it ever reaches Firestore. The encryption key is derived server-side via HKDF from a master secret that never leaves the backend, and is only ever handed to an authenticated client for the duration of a session — never stored anywhere in plaintext or at rest
- **Per-account persistent history** — Firebase Auth + Firestore, synced across devices, with a full "delete everything" control
- **Voice input** — live interim transcript, auto-send on speech end, same safety path as typed messages
- **Daily cost ceilings** — global and per-user caps so free-tier usage stays predictable; crisis replies are always free and uncapped
- **PWA** — installable, offline-aware composer, service worker caching

## Architecture

```
Frontend (Netlify)          Backend (Render)              Data
┌─────────────────┐        ┌──────────────────┐        ┌─────────────┐
│ Vanilla JS PWA   │──────▶ │ FastAPI          │──────▶ │ Firebase    │
│ Web Crypto API   │  TLS   │ crypto_utils.py  │        │ Auth        │
│ Firebase SDK     │◀────── │ Firebase Admin   │◀────── │ Firestore   │
└─────────────────┘        │ Gemini 2.5 Flash │        │ (ciphertext │
                            └──────────────────┘        │  only)      │
                                                          └─────────────┘
```

- **Frontend:** vanilla JS, Three.js background, Firebase Auth/Firestore, Web Crypto API for client-side encryption
- **Backend:** FastAPI on Render, Google Gemini 2.5 Flash for generation, Firebase Admin SDK for session verification
- **Encryption:** AES-256-GCM, HKDF key derivation, per-session key handoff over TLS — see `crypto_utils.py` and `crypto-utils.js`
- **Crisis detection:** layered — deterministic phrase/regex net (guaranteed, model-independent) + Gemini's own safety-aware persona as a secondary layer

## Local setup

```bash
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # fill in GEMINI_API_KEY, MITRA_MASTER_KEY, FIREBASE_SERVICE_ACCOUNT_B64
uvicorn main:app --reload --port 8000
```

Open `frontend/index.html` via Live Server (or any static server) pointed at your local backend (`API_BASE` in `index.html`).

### Required environment variables (backend)

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key |
| `MITRA_MASTER_KEY` | 32-byte base64 secret for AES key derivation — generate with `python -c "import secrets,base64; print(base64.b64encode(secrets.token_bytes(32)).decode())"` |
| `FIREBASE_SERVICE_ACCOUNT_B64` | Base64-encoded Firebase service account JSON, for verifying login tokens server-side |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins (CORS) |
| `MAX_DAILY_MSGS` / `PER_IP_DAILY` | Optional cost-ceiling tuning |

## Testing the crisis detector

```bash
cd backend/tests
python run_recall_test.py
```

Runs the deterministic detector against an independent adversarial test set and reports recall, false-positive rate, and a per-category breakdown. Whenever `CRISIS_PHRASES`/`CRISIS_REGEX` change in `main.py`, the same change must be copied into `tests/crisis_detector.py` (a standalone copy kept for isolated testing) — otherwise this test stops reflecting reality.

## Privacy & safety posture

- Chats are encrypted at rest; even direct Firestore access shows only ciphertext
- Message content is never logged
- Crisis phrases surface Tele-MANAS (14416) — a helpline reference, not an API integration or reporting mechanism
- Anonymous usage metrics only (return visits, session counts) — never message content
- Full account + chat deletion available to any user at any time

## Status

Active solo-founder prototype. Not yet a registered legal entity. Built as part of an ongoing academic + startup effort — see [NetraaLabs](https://netraalabs.netlify.app) for other work in the same vein (computer vision, surveillance safety systems, sign language recognition).

## License

Not yet determined — reach out before reusing.