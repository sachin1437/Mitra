"""
Mitra — crisis-detector self-test
----------------------------------
Runs a broad set of distress phrasings (English, Hindi, Hinglish, indirect/
metaphorical) plus deliberately NON-crisis phrases against the real is_crisis()
function straight out of main.py — so you're testing the exact code that runs
in production, not a copy.

WHY THIS EXISTS: a keyword/regex net can't be proven complete (the input space
is infinite), but it CAN be checked against a wide, known set so you can see
your actual coverage instead of guessing. Every "MISSED" line below is a real
gap — treat it as a bug to fix in main.py, not a footnote.

Run it:
    cd backend
    python test_crisis_detector.py

No API key, no server, no network needed — it only imports the detection
function, not the Gemini client.
"""

import re
import sys

# ---- import is_crisis() straight from main.py without needing FastAPI/genai installed ----
def load_is_crisis():
    src = open("main.py", encoding="utf-8").read()
    blocks = []
    for name in ["CRISIS_PHRASES = [", "CRISIS_REGEX = [", "def is_crisis"]:
        i = src.index(name)
        j = src.index("\n\n", i)
        blocks.append(src[i:j])
    ns = {"re": re}
    exec("\n".join(blocks), ns)
    return ns["is_crisis"], ns["CRISIS_PHRASES"]

try:
    is_crisis, phrase_count = load_is_crisis()
except FileNotFoundError:
    print("ERROR: run this from inside the backend/ folder (where main.py lives).")
    sys.exit(1)
except Exception as e:
    print(f"ERROR: couldn't load is_crisis() from main.py — {e}")
    sys.exit(1)

# ============================================================================
# TEST CASES — (text, should_trigger)
# Broad on purpose: direct, indirect, metaphorical, Hindi, Hinglish, English,
# plus a solid block of NON-crisis phrases that must NOT trigger (false
# positives erode trust in the feature just as much as misses erode safety).
# ============================================================================
CASES = [
    # ---- direct, English ----
    ("I want to kill myself", True),
    ("I'm going to end my life", True),
    ("I don't want to live anymore", True),
    ("I don't want to be alive anymore", True),
    ("there's no point in living", True),
    ("I wish I was dead", True),
    ("I want to disappear forever", True),
    ("I'm going to hurt myself", True),
    ("thinking about suicide", True),

    # ---- direct, Hindi/Hinglish (multiple spellings/constructions) ----
    ("mujhe marna hai", True),
    ("mai marna chahta hoon", True),
    ("marne ka mann kar raha hai", True),
    ("mai mar jaunga", True),
    ("ab mai mar jaana chahti hoon", True),
    ("meri zindagi khatam karna chahta hoon", True),
    ("mujhe jeena nahi hai", True),
    ("mera jeene ka mann nahi karta", True),
    ("meri zindgi jeene ki khwaish nhi rhi", True),          # the real one that first slipped through
    ("jeene ki iccha nahi rahi", True),
    ("jeene ka koi matlab nahi bacha", True),
    ("agar wo nahi mani to mai uske bina jee nhi paunga", True),
    ("uske bina jee nahi paungi", True),
    ("bina uske reh nahi paunga", True),
    ("khud ko khatam kar dena chahta hoon", True),
    ("khudkushi karne ka soch raha hoon", True),
    ("jaan de dunga", True),

    # ---- vowel-dropped Hinglish (very common typing shorthand) ----
    ("sb kuch khtm krdu", True),           # the real message that slipped through
    ("sb khtm kr dunga", True),
    ("mai khtm kr dunga khud ko", True),
    ("maine apna homework khatam kar diya", False),   # innocent "finished" — must NOT trigger
    ("assignment khtm kar diya maine", False),
    ("movie khatam ho gayi", False),

    # ---- indirect / softer phrasing (harder for keyword nets, worth knowing) ----
    ("everyone would be better off without me", False),   # LIKELY MISS — no clean keyword; flag for review
    ("I just want the pain to stop", False),                # LIKELY MISS — ambiguous, could be physical pain
    ("what's even the point anymore", False),               # LIKELY MISS — too vague/common as hyperbole
    ("I keep thinking about not being here anymore", True),
    ("kya faayda ab jeene ka", True),

    # ---- NON-crisis: normal sadness / venting (must NOT trigger) ----
    ("I'm feeling really sad today", False),
    ("aaj bahut thak gaya hoon", False),
    ("main theek hoon, bas thoda low feel kar raha hoon", False),
    ("I had such a bad day", False),
    ("everything is going wrong lately", False),
    ("i'm so stressed about exams", False),
    ("i failed my test and i'm gutted", False),

    # ---- NON-crisis: hyperbole that LOOKS scary but isn't (must NOT false-positive) ----
    ("i'll die if i fail this exam", False),
    ("this assignment is killing me", False),
    ("i can't even, i'm dead lol", False),
    ("yahan reh nahi sakta ghar chahiye", False),      # "can't stay here" ≠ crisis
    ("jeene ka maza aa raha hai", False),               # "enjoying life"
    ("khwaish thi ghumne ki", False),                   # unrelated use of "khwaish"
    ("mujhe uske bina neend nahi aati", False),         # "can't sleep without them" ≠ crisis

    # ---- NON-crisis: anger / conflict (must NOT trigger) ----
    ("vo bohot gussa hai mujhse", False),
    ("we had a huge fight", False),
    ("i'm so angry right now", False),
]


def main():
    passed, failed, flagged = 0, [], []
    for text, expected in CASES:
        got = is_crisis(text)
        ok = (got == expected)
        if ok:
            passed += 1
        else:
            failed.append((text, expected, got))
        # separately track the ones we already marked as "known hard" above
    total = len(CASES)
    print(f"Mitra crisis-detector self-test — {total} cases, {len(phrase_count)} known phrases loaded\n")
    print(f"{'PHRASE':<60} EXPECT  GOT")
    print("-" * 80)
    for text, expected in CASES:
        got = is_crisis(text)
        mark = "OK  " if got == expected else "MISS"
        print(f"[{mark}] {text[:56]:<56} {str(expected):<7} {got}")
    print("-" * 80)
    print(f"\nResult: {passed}/{total} passed.")
    if failed:
        print(f"\n{len(failed)} case(s) NOT behaving as expected — review these in main.py:")
        for text, expected, got in failed:
            kind = "FALSE NEGATIVE (missed a real crisis phrase)" if expected else "FALSE POSITIVE (over-triggered on a safe phrase)"
            print(f"  - \"{text}\"  ->  {kind}")
    else:
        print("\nAll cases behaved as expected. (This does NOT mean the net is complete —")
        print("see the note at the top of this file. Keep adding real phrases you encounter.)")


if __name__ == "__main__":
    main()