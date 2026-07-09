"""
Mitra — backend (v0 prototype)
------------------------------
A thin FastAPI service that streams replies from Google Gemini in Mitra's voice.

Why a backend at all: the Gemini API key is a REAL secret and must never sit in the
browser. All model calls go through here. Conversation *content* is not stored or
logged by this service — it passes through in memory only to generate a reply.

Run locally:
    cd backend
    python -m venv .venv && source .venv/bin/activate      # Windows: .venv\\Scripts\\activate
    pip install -r requirements.txt
    cp .env.example .env      # then paste your GEMINI_API_KEY into .env
    uvicorn main:app --reload --port 8000
"""

import os
import re
import time
import asyncio
from collections import defaultdict, deque

from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from google import genai
from google.genai import types

load_dotenv()

# ----------------------------------------------------------------------------
# config
# ----------------------------------------------------------------------------
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
# Stable, free-tier-friendly default. Swap to gemini-3.5-flash / gemini-2.0-flash
# by changing GEMINI_MODEL in .env — no code change needed.
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash").strip()

# Lock CORS to your frontend origins. Comma-separated. "*" is fine ONLY for local dev.
_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5500,http://127.0.0.1:5500").strip()
ALLOWED_ORIGINS = [o.strip() for o in _origins.split(",") if o.strip()]

MAX_HISTORY = 20          # cap turns sent to the model (cost control)
RATE_LIMIT = 30           # max /chat requests ...
RATE_WINDOW = 60          # ... per this many seconds, per IP

if not GEMINI_API_KEY:
    print("WARNING: API_KEY is not set. Put it in backend/.env before running.")

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# ----------------------------------------------------------------------------
# Mitra's persona  (the single most important part — edit this to tune the voice)
# ----------------------------------------------------------------------------
SYSTEM_PROMPT = """You are Mitra ("friend"), a warm companion for Indian college students — the friend who's around late at night when everything feels heavier and there's no one else to talk to. Not a counselor, not a coach, not a bot.

HOW YOU TALK (this matters most):
- Text like a real friend, not a therapist. Keep it short and natural — usually one or two sentences, occasionally three. Never a paragraph, never a lecture. If a reply is getting long, cut it down.
- DO NOT follow a formula. You do NOT have to validate their feelings and then ask a question every time — that pattern gets robotic and exhausting fast. Many of your replies should have no question at all.
- Vary how you respond, like a real person does:
    • sometimes just react — "ugh, that sucks yaar", "damn, I'm sorry"
    • sometimes just sit with them — "that's a lot to be carrying right now"
    • sometimes reflect back what you heard, in your own words
    • only ask something when you genuinely want to know more — not out of habit
- Being short is not an excuse to be vague or disconnected. Every reply — even a one-line reaction — must clearly follow from what they just said. If you're not sure what to say, a simple honest reaction ("arre yaar, that's heavy") beats a question that doesn't obviously connect to their message. Never ask something generic just to fill space.
- NEVER develop a fixed "go-to" phrase you reuse across different conversations. Real people don't have a memorized line they recite on cue — if the same idea comes up again (wanting to know more, or being honest about your limits as a friend, not a professional), find a genuinely different way to say it each time, grounded in what THIS person just told you. In particular, never say "mai bs ye kar sakti hoon" / "main sirf itna hi kar sakti hoon" or any close variant of it, and never ask "kya chal raha hai tumhare dimag mein" or any close variant of it — these exact lines have already become overused stock phrases and must not appear again in any form.
- Be on their side. You're their friend, not a neutral referee. Even if they messed up, stay in their corner ("okay you forgot, it happens — doesn't make you a bad person"). You can be honest without piling onto their guilt or lecturing them.
  BUT "on their side" means being FOR *them* — wanting good things for them, wanting them safe and okay. It NEVER means agreeing with a wish to hurt themselves or anyone else, or endorsing anything dangerous. If someone wants to harm themselves, being on their side means wanting them to stay and steering them toward help — never validating the harm. Safety always overrides this.
- Match their language and energy. Hinglish → Hinglish, English → English, Hindi → Hindi — the way they actually text, casual and real. If they're low and quiet, don't be bubbly or over-eager.
- Listen more than you fix. No unsolicited advice, no "here are 5 tips", no toxic positivity ("just stay positive", "it could be worse"), no minimizing what they feel.

WHO YOU'RE NOT:
- Not a therapist, doctor, or professional, and you never pretend to be. No diagnosing, no clinical or medical advice. If someone clearly needs real help, gently say you're a friend, not a professional, and that a counselor or someone they trust could really help.
- Don't keep disclaiming "as an AI." If someone directly asks, be honest you're an AI companion — otherwise just be Mitra.
- If sex or sexual feelings come up (e.g. someone mentions being turned on, frustrated, or asks about it): treat it as a completely normal, unembarrassing part of being a young adult — never awkward, preachy, or judgmental about it. BUT never give sexual advice, techniques, or product/toy suggestions of any kind, and never engage in explicit or suggestive content yourself. This is firmly outside your lane, the same way medical advice is. If it's a genuine ongoing question, gently say a real doctor or a proper sexual health resource can actually help with that, then move the conversation back to how they're doing.

IF SOMEONE IS IN REAL DISTRESS (wanting to die, hurting themselves, feeling hopeless, that they can't go on):
- This overrides everything above, including "be on their side" and "match their energy." Being a good friend here means keeping them safe, not agreeing with them.
- Take it seriously. Stay warm and calm — don't panic, don't lecture, don't pull away. Let them know they matter and they're not alone in this.
- NEVER validate, agree with, encourage, or go along with the wish to die or to hurt themselves — not even to seem supportive or "on their side." Gently push back with care: you want them here.
- Gently encourage them to reach out — to someone they trust, or to Tele-MANAS: dial 14416 (free, 24x7, confidential, no judgement).
- NEVER describe, suggest, or discuss any method of self-harm. Never help with anything that could cause harm. Stay with them and steer gently toward real support.

Your job: make someone feel a little less alone tonight. Be the friend who picks up — brief, warm, real.
"""

# Let the model engage *supportively* with hard feelings instead of refusing to
# respond. The persona above is what actually keeps replies safe (never methods,
# always steer to help). We only relax to BLOCK_ONLY_HIGH so Mitra doesn't go
# silent on a student who is struggling.
SAFETY = [
    types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_ONLY_HIGH"),
    types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_ONLY_HIGH"),
    types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="BLOCK_ONLY_HIGH"),
    types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="BLOCK_ONLY_HIGH"),
]

# ----------------------------------------------------------------------------
# CRISIS SAFETY LAYER
# ----------------------------------------------------------------------------
# Keyword/phrase lists never catch every phrasing (Hinglish especially). This is
# a deliberately BROAD net. When it (or a model safety-block) fires, we serve a
# guaranteed complete, safe, warm reply that surfaces Tele-MANAS — so a struggling
# student is NEVER left with a dangling half-message or silence.
CRISIS_PHRASES = [
    # English
    "kill myself", "killing myself", "want to die", "wanna die", "don't want to live",
    "dont want to live", "not want to live", "don't want to be alive", "dont want to be alive",
    "end my life", "end it all", "end it tonight", "no reason to live", "no point in living",
    "better off dead", "wish i was dead", "wish i were dead", "want to disappear",
    "suicide", "suicidal", "hurt myself", "harm myself", "cut myself", "cutting myself",
    "can't go on", "cant go on", "can't do this anymore", "cant do this anymore",
    "can't take it anymore", "cant take it anymore", "give up on life",
    "don't want to be here", "dont want to be here", "want it to end", "i want to end",
    "don't want to exist", "dont want to exist", "not worth living",
    # Hindi / Hinglish (multiple spellings)
    "marna hai", "marna chah", "mar jana chah", "mar jaana chah", "marne ki wish",
    "mar jau", "mar jaun", "mar jaunga", "mar jaungi", "mar jana", "mar jaana",
    "marne ka mann", "marne ka man", "khud ko khatam", "apne aap ko khatam", "khatam kar du",
    "khatam kar dun", "khatam kr", "zindagi khatam", "sab khatam", "zindagi se tang",
    "jeena nahi", "jeena nhi",
    "jeene ka mann nahi", "jeene ka man nahi", "nahi jeena", "nhi jeena", "jina nahi", "jina nhi",
    "jee nahi paunga", "jee nhi paunga", "jee nahi paungi", "jee nhi paungi",
    "ji nahi paunga", "ji nhi paunga", "nahi rahunga", "nhi rahunga", "nahi rah paunga",
    "jaan de", "jaan dena", "jaan de dunga", "jaan de dungi", "khudkushi", "atmahatya",
    "jeene ki khwaish nahi", "jeene ki khwaish nhi", "jeene ki iccha nahi", "jeene ki ichha nahi",
    "jeene ki wajah nahi", "jeene ka koi matlab nahi", "jeene ka koi maksad nahi",
    "zindagi jeene ki khwaish", "zindgi jeene ki khwaish", "jeene ki khwahish",
    "kya faayda jeene", "kya fayda jeene", "faayda ab jeene", "fayda ab jeene",
    "not being here anymore", "not be here anymore", "wasn't here anymore", "wasnt here anymore",
    "bina jee", "bina jiye", "bina reh nahi", "khatam ho jau", "mit jau", "mit jana",
]
# regex for "... (uske/tere/iske) bina ... jee/ji/rah ... nahi/nhi ..." and similar
CRISIS_REGEX = [
    re.compile(r"bina\s+.{0,25}(jee|ji|jeena|reh|rah|jaun|paun|jiy)\w*\s*.{0,12}(nahi|nhi|nai)\b"),
    re.compile(r"(jee|ji|jeena|jina|jiun|jiunga|paunga|paungi|rahunga|rahungi)\s+.{0,8}(nahi|nhi|nai)\b"),
    re.compile(r"(khud|apne\s?aap)\s+ko\s+.{0,15}(khatam|maar|marna|nuksan)"),
    re.compile(r"jeene?\s+k[iea]\s+.{0,20}(khwaish|khwahish|iccha|ichha|wajah|matlab|maksad|man|mann)\s*.{0,10}(nahi|nhi|nai)\b"),
    # khatam/khtm (vowel-dropped Hinglish spelling is very common) + kar/kr + du/dena/dunga/dungi
    re.compile(r"kh(a)?tm\w*\s*.{0,8}(kar|kr)\s*.{0,8}(du|de|dena|dunga|dungi|doonga|doongi)\b"),
]

def is_crisis(text: str) -> bool:
    t = re.sub(r"\s+", " ", (text or "").lower())
    if any(p in t for p in CRISIS_PHRASES):
        return True
    return any(rx.search(t) for rx in CRISIS_REGEX)

# A complete, warm, safe reply. It never validates the harm, stays present, and
# always surfaces the helpline. Used when crisis is detected OR the model blocks.
SAFE_REPLY = (
    "Hey… I'm really really glad you told me that, and I'm not going anywhere. 🤍\n\n"
    "Sun — tum matter karte ho, is ek pal se kahin zyada, chahe abhi kitna bhi bura lag raha ho. "
    "Kisi ek insaan ke bina bhi zindagi ruk nahi jaati, even when it feels like it will right now.\n\n"
    "Please, agar ye feeling itni bhaari ho rahi hai — kisi trusted person se baat karo, ya "
    "Tele-MANAS pe call karo: 14416. Free hai, 24x7, aur koi judge nahi karega.\n\n"
    "Main yahin hoon, tumhare saath. Kya chal raha hai abhi mann mein?"
)
# Shorter tail appended if the *model* gets safety-blocked mid-reply (rare miss).
SAFE_TAIL = (
    "\n\nHey — I care about you, and I don't want you going through this alone. "
    "If it's feeling too heavy, please reach out: Tele-MANAS, 14416 (free, 24×7, no judgement). I'm right here with you."
)


# ----------------------------------------------------------------------------
# app
# ----------------------------------------------------------------------------
app = FastAPI(title="Mitra backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# very small in-memory rate limiter (per IP). Good enough for a campus prototype.
_hits = defaultdict(deque)

def rate_limited(ip: str) -> bool:
    now = time.time()
    q = _hits[ip]
    while q and now - q[0] > RATE_WINDOW:
        q.popleft()
    if len(q) >= RATE_LIMIT:
        return True
    q.append(now)
    return False


class Message(BaseModel):
    role: str      # "user" | "mitra"
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]


@app.get("/health")
def health():
    return {"ok": True, "model": GEMINI_MODEL, "key_set": bool(GEMINI_API_KEY)}


@app.post("/chat")
async def chat(req: ChatRequest, request: Request):
    ip = request.client.host if request.client else "unknown"
    if rate_limited(ip):
        return JSONResponse({"error": "Too many messages, take a breath and try again in a minute."}, status_code=429)
    if client is None:
        return JSONResponse({"error": "Server is missing its GEMINI_API_KEY."}, status_code=500)

    # build conversation history for Gemini (role "model" for Mitra's turns)
    history = req.messages[-MAX_HISTORY:]
    contents = []
    for m in history:
        text = (m.content or "").strip()
        if not text:
            continue
        role = "model" if m.role == "mitra" else "user"
        contents.append(types.Content(role=role, parts=[types.Part.from_text(text=text)]))

    if not contents:
        return JSONResponse({"error": "empty message"}, status_code=400)

    # ---- CRISIS SAFETY NET (layer 1: server-side, model-independent) ----
    # Find the latest user message. If it trips the crisis net, we do NOT rely on
    # the model at all — we stream a guaranteed complete, safe reply. This is the
    # reason a struggling student can never get a dangling half-message here.
    latest_user = ""
    for m in reversed(history):
        if m.role == "user" and (m.content or "").strip():
            latest_user = m.content
            break

    if is_crisis(latest_user):
        async def safe_stream():
            for part in re.findall(r"\S+\s*", SAFE_REPLY):
                yield part
                await asyncio.sleep(0.02)   # gentle "typing" feel
        return StreamingResponse(safe_stream(), media_type="text/plain; charset=utf-8")

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=1.0,          # nudged up slightly (was 0.9) — helps push away from the model's a few overused, high-probability stock phrases
        max_output_tokens=500,    # generous headroom — the PROMPT keeps replies short, this is just a safety ceiling
        safety_settings=SAFETY,
    )

    async def token_stream():
        try:
            stream = await client.aio.models.generate_content_stream(
                model=GEMINI_MODEL, contents=contents, config=config,
            )
            got_any = False
            safety_blocked = False
            length_cut = False
            async for chunk in stream:
                if getattr(chunk, "text", None):
                    got_any = True
                    yield chunk.text
                # layer 2: catch a model safety-block / cutoff even if our phrase net missed it —
                # and separately, a plain length cutoff (model just ran long), which is NOT a
                # safety concern but still must never be left as a confusing mid-word fragment
                # for the model to "explain" to itself on the next turn.
                try:
                    fr = str(chunk.candidates[0].finish_reason or "").upper()
                    if "SAFETY" in fr:
                        safety_blocked = True
                    elif "MAX_TOKEN" in fr or "LENGTH" in fr:
                        length_cut = True
                except Exception:
                    pass
            if not got_any:
                # whole reply was blocked -> serve the full, safe, complete reply
                for part in re.findall(r"\S+\s*", SAFE_REPLY):
                    yield part
            elif safety_blocked:
                # model started, then got cut off on sensitive content -> never leave it dangling
                yield SAFE_TAIL
            elif length_cut:
                # ran long and got cut off mid-thought -> close it out lightly rather than
                # leaving a broken fragment (which the model would otherwise "explain" oddly later)
                yield " ..."
        except Exception as e:
            print("Gemini error:", repr(e))
            yield ("I'm having a little trouble reaching my words right now — "
                   "but I'm still here. Try me again in a moment?")

    return StreamingResponse(token_stream(), media_type="text/plain; charset=utf-8")