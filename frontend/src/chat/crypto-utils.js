/**
 * Mitra encryption core — client side (browser, Web Crypto API).
 *
 * V1 design: the backend (crypto_utils.py) does the HKDF derivation
 * server-side using the master secret, which NEVER leaves the server.
 * The client just fetches its own derived key once per session (from
 * GET /session-key, authenticated with the Firebase ID token) and
 * imports those raw bytes directly as an AES-256-GCM key.
 *
 * This keeps the master secret fully server-side while still avoiding
 * ever storing the derived key anywhere (Firestore, localStorage) —
 * it's re-fetched fresh each session and held only in JS memory /
 * inside the non-extractable Web Crypto key object.
 */

const NONCE_SIZE = 12; // bytes, 96-bit — must match backend

/**
 * Fetch this session's AES key from the backend and import it.
 * Call once after Firebase login, using the user's ID token.
 */
async function fetchSessionKey(apiBase, idToken) {
  const resp = await fetch(apiBase + "/session-key", {
    headers: { Authorization: "Bearer " + idToken },
  });
  if (!resp.ok) {
    throw new Error("could not obtain session key (auth expired or server error)");
  }
  const { key } = await resp.json();
  const rawBytes = Uint8Array.from(atob(key), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "raw",
    rawBytes,
    "AES-GCM",
    false, // not extractable — key stays inside Web Crypto, can't be read out by JS/XSS
    ["encrypt", "decrypt"]
  );
}

/** Encrypt plaintext string -> base64(nonce || ciphertext+tag), same format as backend. */
async function encryptMessage(plaintext, key, userUid) {
  const nonce = crypto.getRandomValues(new Uint8Array(NONCE_SIZE));
  const aad = new TextEncoder().encode(userUid);
  const ptBytes = new TextEncoder().encode(plaintext);

  const ctBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce, additionalData: aad, tagLength: 128 },
    key,
    ptBytes
  );

  const blob = new Uint8Array(nonce.length + ctBuffer.byteLength);
  blob.set(nonce, 0);
  blob.set(new Uint8Array(ctBuffer), nonce.length);

  return btoa(String.fromCharCode(...blob));
}

/** Decrypt base64 blob -> plaintext string. Throws on tamper/wrong key. */
async function decryptMessage(ciphertextB64, key, userUid) {
  const blob = Uint8Array.from(atob(ciphertextB64), (c) => c.charCodeAt(0));
  const nonce = blob.slice(0, NONCE_SIZE);
  const ct = blob.slice(NONCE_SIZE);
  const aad = new TextEncoder().encode(userUid);

  try {
    const ptBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nonce, additionalData: aad, tagLength: 128 },
      key,
      ct
    );
    return new TextDecoder().decode(ptBuffer);
  } catch (e) {
    // Never leak internals — same posture as backend
    throw new Error("decryption failed: invalid ciphertext, key, or tampered data");
  }
}

export { fetchSessionKey, encryptMessage, decryptMessage };