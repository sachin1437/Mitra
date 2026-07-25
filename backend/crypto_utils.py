"""
Mitra encryption core — server side.

Design:
- Master secret lives ONLY in env var (Render), never in code/git.
- Per-user key derived deterministically via HKDF(uid, master_secret) —
  key is never transmitted, never stored.
- Each message encrypted with AES-256-GCM using a fresh random nonce
  (never reuse a nonce with the same key — breaks GCM security entirely).
- Output format: base64(nonce || ciphertext || tag) so it's one string
  to store in Firestore.
"""

import os
import base64
import secrets
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# ---- Master secret -----------------------------------------------------
# MUST be set in Render env vars. 32 random bytes, base64-encoded.
# Generate once with: python -c "import secrets,base64; print(base64.b64encode(secrets.token_bytes(32)).decode())"
_MASTER_SECRET_B64 = os.environ.get("MITRA_MASTER_KEY")
if not _MASTER_SECRET_B64:
    raise RuntimeError(
        "MITRA_MASTER_KEY env var not set. Never hardcode this — set it in Render dashboard."
    )
MASTER_SECRET = base64.b64decode(_MASTER_SECRET_B64)
if len(MASTER_SECRET) < 32:
    raise RuntimeError("MITRA_MASTER_KEY must decode to at least 32 bytes.")


# ---- Key derivation (HKDF) ---------------------------------------------
def derive_user_key(user_uid: str) -> bytes:
    """
    Deterministically derive a 32-byte AES-256 key for a given user.
    Same uid + same master secret -> same key, always. Never stored.

    HKDF, not plain hashing: HKDF is built for exactly this (expanding
    an already-strong secret into per-context subkeys) and is what
    NIST/IETF (RFC 5869) recommend over hand-rolled HMAC chaining.
    """
    if not user_uid or not isinstance(user_uid, str):
        raise ValueError("user_uid must be a non-empty string")

    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=32,                              # 256-bit key for AES-256
        salt=None,                              # master secret already high-entropy
        info=f"mitra-user-key:{user_uid}".encode("utf-8"),  # binds key to this exact user
    )
    return hkdf.derive(MASTER_SECRET)


# ---- Encrypt / Decrypt (AES-256-GCM) ------------------------------------
NONCE_SIZE = 12   # 96-bit nonce, standard/recommended for GCM
TAG_SIZE = 16     # GCM auth tag, appended automatically by the library


def encrypt_message(plaintext: str, user_uid: str) -> str:
    """
    Encrypt plaintext for a given user. Returns base64 string safe to
    store directly in Firestore.
    """
    if plaintext is None:
        raise ValueError("plaintext cannot be None")

    key = derive_user_key(user_uid)
    aesgcm = AESGCM(key)

    nonce = secrets.token_bytes(NONCE_SIZE)     # MUST be fresh every call — never reuse
    pt_bytes = plaintext.encode("utf-8")

    # associated_data binds ciphertext to this user — prevents ciphertext
    # from one user being replayed/decrypted under another user's context
    aad = user_uid.encode("utf-8")

    ct = aesgcm.encrypt(nonce, pt_bytes, aad)   # ct already includes the 16-byte tag

    blob = nonce + ct
    return base64.b64encode(blob).decode("utf-8")


def decrypt_message(ciphertext_b64: str, user_uid: str) -> str:
    """
    Decrypt a stored ciphertext string back to plaintext.
    Raises ValueError on tamper/wrong-key/corruption — never leak
    partial plaintext or internal details in the error.
    """
    try:
        blob = base64.b64decode(ciphertext_b64)
        nonce, ct = blob[:NONCE_SIZE], blob[NONCE_SIZE:]

        key = derive_user_key(user_uid)
        aesgcm = AESGCM(key)
        aad = user_uid.encode("utf-8")

        pt_bytes = aesgcm.decrypt(nonce, ct, aad)
        return pt_bytes.decode("utf-8")
    except Exception:
        # Never surface crypto internals or partial plaintext in errors —
        # that itself is an info leak. Log generically server-side only.
        raise ValueError("decryption failed: invalid ciphertext, key, or tampered data")


# ---- Self-test -----------------------------------------------------------
if __name__ == "__main__":
    uid = "test-user-123"
    msg = "I've been feeling really anxious about my exams lately."

    ct = encrypt_message(msg, uid)
    print("Ciphertext (stored in Firestore):", ct)

    pt = decrypt_message(ct, uid)
    print("Decrypted:", pt)
    assert pt == msg, "round-trip failed"

    # isolation check — wrong user must NOT decrypt
    try:
        decrypt_message(ct, "different-user-456")
        print("FAIL: wrong user decrypted successfully — should never happen")
    except ValueError:
        print("PASS: wrong user correctly rejected")

    # tamper check — flipped byte must be detected
    tampered = base64.b64encode(
        bytearray(base64.b64decode(ct))[:-1] + b"\x00"
    ).decode()
    try:
        decrypt_message(tampered, uid)
        print("FAIL: tampered ciphertext decrypted — should never happen")
    except ValueError:
        print("PASS: tampering correctly detected (GCM auth tag caught it)")