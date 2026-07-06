# Mitra — chat prototype (v0)

A warm, late-night AI companion for Indian college students. This is the **prototype**
whose only job is to answer one question: *do students talk to Mitra, come back, and go deep?*
That retention-and-depth signal is what you take into a pitch — not a polished app.

## What's here

```
mitra-app/
  frontend/            ← the chat app (static, mobile-first PWA)
    index.html         ← the whole UI + client logic
    manifest.webmanifest, sw.js, icon-*.png   ← installable-to-home-screen bits
  backend/             ← FastAPI service that holds the Gemini key & streams replies
    main.py            ← persona + safety + streaming live here
    requirements.txt, .env.example, .gitignore
  firestore-metrics.rules   ← add to your Firebase rules for anonymous metrics
```

## The privacy model (be able to say this honestly)

- **Message content is never stored.** Conversations live only in the student's browser
  (localStorage). Nothing is written to any database.
- To generate a reply, messages pass through your backend → Google Gemini, used only to
  produce the response. Not stored by us, not read by a human.
- **This is NOT on-device inference.** True "nothing ever leaves your phone" needs a local
  model — that's a real-product decision, not v0. So don't claim more than the above.
- Only **anonymous signals** are logged (session id, counts, timing, return visits) — no text.

## Run it locally

### 1. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                 # then edit .env, paste your GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```
Get a free key in ~2 clicks: https://aistudio.google.com/app/apikey
The key is a **real secret** — it lives only in `.env`, never in the frontend, never in git.

Check it's alive: open http://localhost:8000/health → should show `"key_set": true`.

### 2. Frontend
Serve `frontend/` with any static server (VS Code **Live Server** is easiest — it runs on
port 5500, which the backend already allows). Open `index.html`. Mitra should greet you;
type a message and you'll see a streamed reply.

If replies fail, it's almost always one of: backend not running, `GEMINI_API_KEY` missing,
or a CORS origin mismatch (the port serving the frontend must be in `ALLOWED_ORIGINS`).

### 3. Metrics (optional but that's the whole point)
Open `frontend/index.html`, find the `firebaseConfig` block, and paste the **same config
you used in the survey** (replace `PASTE_FROM_SURVEY`). Then add the block from
`firestore-metrics.rules` to your Firebase rules and Publish. Metrics land in a new
`mitra_events` collection. If you skip this, the chat still works — metrics just no-op.

## Deploy it

- **Frontend** → Netlify (drag `frontend/` folder, or connect a repo). Static, no build.
- **Backend** → a host that runs Python: **Render** or **Railway** (both have free tiers).
  Set `GEMINI_API_KEY` as an environment variable there. Start command:
  `uvicorn main:app --host 0.0.0.0 --port $PORT`
- After both are live: put the backend's `https://…` URL into `API_BASE` at the top of the
  frontend script, add the frontend's URL to the backend's `ALLOWED_ORIGINS`, and add it to
  Firebase → Authentication → Authorized domains.

## What to measure

- **Retention** = a `deviceId` that shows up across multiple sessions / days (`isReturn`, repeat `session` events).
- **Depth** = `msg` events per `sessionId`, and time between first and last event in a session.
The number that matters: *do the same students come back a second time?*

## Honest caveats (read these)

- **The persona is the risk, not the code.** The voice in `SYSTEM_PROMPT` (in `main.py`) is
  what makes students return or bounce. Test it, then tune that text. Everything else is plumbing.
- **The crisis card is a crude backstop**, not a safety system. It catches obvious keywords and
  surfaces Tele-MANAS (14416). A real product needs a proper safety layer and, ideally, a
  psychology collaborator before wide release.
- **`/chat` is an open endpoint** using your key. CORS + a basic rate limit protect it, but a
  determined abuser could still burn quota. Fine for a small campus test; add App Check /
  auth before it spreads wide.
- **Free-tier limits**: Gemini's free tier has request/day caps. Plenty for a pilot; watch it
  if usage climbs.
