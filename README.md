# Mitra 🤍

**Your late-night friend.** A privacy-first AI companion for Indian college students, built for the moments when everything feels heavier and there's no one else to talk to.

Live at [mitra.cybernetic.co.in](https://mitra.cybernetic.co.in)

---

## What Mitra is

Mitra isn't a therapist, a coach, or a productivity bot. It's the friend who picks up at 2am. Warm, honest, occasionally in Hinglish, and genuinely present. It listens more than it advises, remembers your conversations, and never turns into a homework-doing assistant.

Built solo, currently unregistered as any legal entity.

## Core features

- **Persona-tuned conversation.** Casual, warm, no therapy-speak. Language starts in English and eases into natural Hinglish as the conversation goes on. Rules against repeating itself, tuned to keep the conversation actually alive instead of feeling like an interview.
- **Crisis safety layer.** A deterministic, model-independent phrase and pattern net that guarantees a safe, warm, complete reply surfacing Tele-MANAS (14416) the moment real distress shows up. Tested against an independent 39-case adversarial set spanning English, Hindi, and Hinglish, including indirect, metaphorical, and code-switched phrasing. Currently at **93.1% recall, 0% false positives**.
- **Encrypted chat history.** Every message is encrypted on the device before it ever reaches the database (AES-256-GCM). The encryption key is derived on the server from a secret that never leaves the backend, and is only ever handed to an already-authenticated client for that session. Nothing is ever stored in plaintext.
- **Per-account persistent history.** Firebase Auth and Firestore, synced across devices, with a full "delete everything" option.
- **Voice input.** Live transcript while you speak, auto-sends when you stop, goes through the exact same safety checks as typed messages.
- **Daily cost ceilings.** Global and per-user limits so free-tier usage stays predictable. Crisis replies are never capped or counted against this.
- **Installable PWA.** Works offline for the composer, cached via service worker.

## Architecture

```
 Frontend (Netlify)    Backend (Render)       Data (Firebase)
+-------------------+      +-------------------+      +-------------------+
| Vanilla JS PWA    | ---> | FastAPI           | ---> | Auth              |
| Web Crypto API    | <--- | crypto_utils.py   | <--- | Firestore         |
| Firebase SDK      |      | Firebase Admin    |      | (ciphertext only) |
|                   |      | Gemini 2.5 Flash  |      |                   |
+-------------------+      +-------------------+      +-------------------+
```

Messages are encrypted in the browser and sent to Firebase as ciphertext only.
The backend never stores chat content. It just derives session keys and calls
Gemini for a reply.

- **Frontend:** vanilla JS, Three.js background, Firebase Auth/Firestore, Web Crypto API for client-side encryption
- **Backend:** FastAPI on Render, Google Gemini 2.5 Flash for generation, Firebase Admin SDK for verifying sessions
- **Encryption:** AES-256-GCM with HKDF key derivation, handed off per session over TLS. See `crypto_utils.py` and `crypto-utils.js`
- **Crisis detection:** layered. A deterministic phrase/pattern net comes first and is guaranteed to fire, backed up by Gemini's own safety-aware persona as a second layer

## Local setup

```bash
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # fill in GEMINI_API_KEY, MITRA_MASTER_KEY, FIREBASE_SERVICE_ACCOUNT_B64
uvicorn main:app --reload --port 8000
```

Open `frontend/index.html` through Live Server (or any static server) pointed at your local backend. Set `API_BASE` in `index.html` accordingly.

### Required environment variables (backend)

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key |
| `MITRA_MASTER_KEY` | 32-byte base64 secret used to derive encryption keys. Generate with `python -c "import secrets,base64; print(base64.b64encode(secrets.token_bytes(32)).decode())"` |
| `FIREBASE_SERVICE_ACCOUNT_B64` | Base64-encoded Firebase service account JSON, used to verify login tokens server-side |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins (CORS) |
| `MAX_DAILY_MSGS` / `PER_IP_DAILY` | Optional cost-ceiling tuning |

## Testing the crisis detector

```bash
cd backend/tests
python run_recall_test.py
```

Runs the deterministic detector against an independent adversarial test set and reports recall, false-positive rate, and a breakdown by category. Whenever `CRISIS_PHRASES` or `CRISIS_REGEX` change in `main.py`, copy the same change into `tests/crisis_detector.py` too, since that's a standalone copy kept just for isolated testing. Otherwise this test quietly stops meaning anything.

## Privacy & safety posture

- Chats are encrypted at rest. Even someone with direct Firestore access only sees ciphertext
- Message content is never logged
- Crisis phrases surface Tele-MANAS (14416), a helpline reference, not an automated report or API integration
- Usage metrics are anonymous only (return visits, session counts). Never message content
- Full account and chat deletion is available to any user, anytime

## Status

Active solo-founder prototype. Not yet a registered legal entity.

## License

Not yet decided. Reach out before reusing anything here.