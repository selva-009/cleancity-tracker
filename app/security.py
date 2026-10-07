"""
CleanCity Tracker — security helpers.
Password hashing (PBKDF2-HMAC-SHA256), signed stateless session tokens (HMAC),
and file-upload validation. No secrets are hard-coded: the signing key is read
from the CCT_SECRET env var or generated once into a git-ignored file.
"""
import os, hmac, json, base64, hashlib, secrets, time, datetime

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECRET_FILE = os.path.join(BASE, ".secret")
TOKEN_TTL_SECONDS = 60 * 60 * 8   # 8 hours

# ---------------- signing key ----------------
def _load_secret():
    env = os.environ.get("CCT_SECRET")
    if env:
        return env.encode()
    if os.path.exists(SECRET_FILE):
        return open(SECRET_FILE, "rb").read()
    key = secrets.token_bytes(48)
    with open(SECRET_FILE, "wb") as f:
        f.write(key)
    try:
        os.chmod(SECRET_FILE, 0o600)
    except OSError:
        pass
    return key

SECRET = _load_secret()

# ---------------- password hashing ----------------
PBKDF2_ROUNDS = 200_000

def hash_password(password: str) -> str:
    if not isinstance(password, str) or len(password) < 8:
        raise ValueError("Password must be at least 8 characters.")
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ROUNDS)
    return f"pbkdf2_sha256${PBKDF2_ROUNDS}${base64.b64encode(salt).decode()}${base64.b64encode(dk).decode()}"

def verify_password(password: str, stored: str) -> bool:
    try:
        algo, rounds, salt_b64, hash_b64 = stored.split("$")
        if algo != "pbkdf2_sha256":
            return False
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(hash_b64)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, int(rounds))
        return hmac.compare_digest(dk, expected)
    except Exception:
        return False

# ---------------- session tokens (HMAC-signed) ----------------
def _b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()

def _unb64(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))

def make_token(user_id: int, role: str) -> str:
    payload = {"uid": user_id, "role": role, "exp": int(time.time()) + TOKEN_TTL_SECONDS}
    body = _b64(json.dumps(payload, separators=(",", ":")).encode())
    sig = _b64(hmac.new(SECRET, body.encode(), hashlib.sha256).digest())
    return f"{body}.{sig}"

def verify_token(token: str):
    """Return payload dict or None. Verifies signature and expiry."""
    if not token or "." not in token:
        return None
    try:
        body, sig = token.rsplit(".", 1)
        expected = _b64(hmac.new(SECRET, body.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, expected):
            return None
        payload = json.loads(_unb64(body))
        if int(payload.get("exp", 0)) < int(time.time()):
            return None
        return payload
    except Exception:
        return None

# ---------------- upload validation ----------------
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024   # 10 MB

_MAGIC = {
    b"\xff\xd8\xff": "jpg",
    b"\x89PNG\r\n\x1a\n": "png",
    b"GIF87a": "gif", b"GIF89a": "gif",
}

def sniff_image(header: bytes):
    """Return a safe extension if the bytes look like an allowed image, else None."""
    for magic, ext in _MAGIC.items():
        if header.startswith(magic):
            return ext
    if header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        return "webp"
    return None

def random_filename(ext: str) -> str:
    return secrets.token_hex(16) + "." + ext
