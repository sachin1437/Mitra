"""
Run this LOCALLY (on your machine, not here) to convert your downloaded
Firebase service account JSON into a single-line base64 string for Render.

Usage:
    python convert_key.py path/to/serviceAccountKey.json
"""
import sys, json, base64

path = sys.argv[1]
with open(path) as f:
    data = json.load(f)  # validates it's real JSON

encoded = base64.b64encode(json.dumps(data).encode()).decode()
print("\nCopy this whole line into Render env var FIREBASE_SERVICE_ACCOUNT_B64:\n")
print(encoded)