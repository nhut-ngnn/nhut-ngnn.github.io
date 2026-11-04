// Personal invitation links.
//
//   ?k=<token>  secret link. The token (16 random bytes, base64url) is stretched
//               with HKDF into an AES-256-GCM key and a file id; the encrypted
//               file assets/invitations/<file id>.bin holds the guest's name,
//               word-game word and (optionally) their personal letter image.
//   ?to=<name>  quick link. The name is only base64url-encoded, no file needed.
//
// Must match bin/encrypt_invitations.py.
window.InviteLink = (function () {
  const SALT = new TextEncoder().encode("nhut-ngnn-graduation-invitation");
  const INFO = new TextEncoder().encode("invitation-link-v2");
  const TOKEN_BYTES = 16;

  function b64urlEncode(bytes) {
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function b64urlDecode(text) {
    const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
    return Uint8Array.from(atob(b64 + "===".slice((b64.length + 3) % 4)), (c) => c.charCodeAt(0));
  }

  const toHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

  function encodeName(name) {
    return b64urlEncode(new TextEncoder().encode(name));
  }

  function decodeName(value) {
    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(b64urlDecode(value)).trim();
      if (text) return text;
    } catch (_) {
      /* not base64: use as is */
    }
    return value.trim();
  }

  function newToken() {
    return b64urlEncode(crypto.getRandomValues(new Uint8Array(TOKEN_BYTES)));
  }

  async function derive(token) {
    const raw = b64urlDecode(token.trim());
    if (raw.length !== TOKEN_BYTES) throw new Error("bad-token");
    const ikm = await crypto.subtle.importKey("raw", raw, "HKDF", false, ["deriveBits"]);
    const bits = new Uint8Array(
      await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: SALT, info: INFO }, ikm, 384)
    );
    const key = await crypto.subtle.importKey("raw", bits.slice(0, 32), "AES-GCM", false, ["encrypt", "decrypt"]);
    return { key, fileId: toHex(bits.slice(32, 48)) };
  }

  // -> { name, word, image: Blob | null }
  async function open(token, baseUrl) {
    const { key, fileId } = await derive(token);
    const response = await fetch(`${baseUrl}/${fileId}.bin`, { cache: "no-cache" });
    if (!response.ok) throw new Error("not-found");
    const data = new Uint8Array(await response.arrayBuffer());
    const plain = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: data.slice(0, 12) }, key, data.slice(12)));
    const metaLength = (plain[0] << 8) | plain[1];
    const meta = JSON.parse(new TextDecoder().decode(plain.slice(2, 2 + metaLength)));
    const body = plain.slice(2 + metaLength);
    const image = body.length ? new Blob([body], { type: meta.type || "image/png" }) : null;
    return { name: meta.name, word: meta.word, image };
  }

  // -> { token, fileId, file: Blob }  (file goes to assets/invitations/<fileId>.bin)
  async function seal({ name, word, image }) {
    const token = newToken();
    const { key, fileId } = await derive(token);
    const meta = new TextEncoder().encode(JSON.stringify(image ? { name, word, type: image.type || "image/png" } : { name, word }));
    const body = image ? new Uint8Array(await image.arrayBuffer()) : new Uint8Array(0);
    const payload = new Uint8Array(2 + meta.length + body.length);
    payload[0] = meta.length >> 8;
    payload[1] = meta.length & 255;
    payload.set(meta, 2);
    payload.set(body, 2 + meta.length);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, payload));
    return { token, fileId, file: new Blob([iv, cipher], { type: "application/octet-stream" }) };
  }

  // Stable word for quick-link guests (no encrypted file to carry one).
  function wordFor(name, words) {
    let h = 2166136261;
    for (const ch of name.toLowerCase()) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0;
    return words[h % words.length];
  }

  return { encodeName, decodeName, newToken, derive, open, seal, wordFor };
})();
