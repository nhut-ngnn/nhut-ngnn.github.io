"""Build personal invitation links for the /invitation/ page.

Every guest gets a secret link  https://nhut-ngnn.github.io/invitation/?k=<token>.
The token (16 random bytes, base64url) is stretched with HKDF-SHA256 into an
AES-256-GCM key and a file id. assets/invitations/<file id>.bin holds the
guest's name, word-game word and personal letter image, so the published files
reveal nothing without the link.

Each guest's letter is an image named Graduation_Invitation_<First_Last>.png
in the images dir. To add a guest, drop their image in the folder and run the
script again: existing guests keep their token (and link), new guests get one.
Guests can also be added in the browser at /invitation/add/.

Usage:
    python bin/encrypt_invitations.py "<images dir>" [links.csv]

Links are kept in links.csv (default: invitation_links.csv next to the images
dir, NOT in the repo) and reused on re-runs. Only files this script created are
replaced or removed; files added from /invitation/add/ are left alone.
"""

import base64
import csv
import json
import os
import secrets
import struct
import sys
from pathlib import Path

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

# Must match assets/js/invitation-crypto.js
SALT = b"nhut-ngnn-graduation-invitation"
INFO = b"invitation-link-v2"
TOKEN_BYTES = 16
SITE = "https://nhut-ngnn.github.io/invitation/"

# Secret words for the word game, one per guest. Must match words in assets/js/invitation-config.js
WORDS = [
    "PARTY", "SMILE", "DREAM", "PROUD", "CHEER", "HAPPY", "TOAST", "BRAVE",
    "SHINE", "MAGIC", "PHOTO", "LAUGH", "HEART", "MUSIC", "GRADE", "STUDY",
    "CLASS", "BLOOM", "LUCKY", "HONOR", "YOUTH", "QUEST",
    "UNITY", "GLORY", "MERRY", "SUNNY", "TRUST", "SPARK",
]
IMAGE_TYPES = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}

REPO = Path(__file__).resolve().parent.parent
OUT_DIR = REPO / "assets" / "invitations"
FIELDS = ["name", "link", "token", "word", "file"]


def b64url(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def unb64url(text):
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def new_token():
    return b64url(secrets.token_bytes(TOKEN_BYTES))


def is_valid(token):
    try:
        return len(unb64url(token)) == TOKEN_BYTES
    except (ValueError, TypeError):
        return False


def derive(token):
    material = HKDF(algorithm=hashes.SHA256(), length=48, salt=SALT, info=INFO).derive(unb64url(token))
    return material[:32], material[32:48].hex()


def guest_name(path):
    stem = path.stem.removeprefix("Graduation_Invitation_")
    return stem.replace("_", " ").strip()


def seal(token, name, word, image):
    key, file_id = derive(token)
    meta = json.dumps({"name": name, "word": word, "type": IMAGE_TYPES[image.suffix.lower()]}).encode("utf-8")
    payload = struct.pack(">H", len(meta)) + meta + image.read_bytes()
    iv = os.urandom(12)
    (OUT_DIR / f"{file_id}.bin").write_bytes(iv + AESGCM(key).encrypt(iv, payload, None))
    return file_id


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    images_dir = Path(sys.argv[1])
    links_csv = Path(sys.argv[2]) if len(sys.argv) > 2 else images_dir.parent / "invitation_links.csv"

    previous = {}
    if links_csv.exists():
        with links_csv.open(newline="", encoding="utf-8-sig") as f:
            previous = {row["file"]: row for row in csv.DictReader(f) if is_valid(row.get("token", ""))}

    images = sorted(p for p in images_dir.iterdir() if p.suffix.lower() in IMAGE_TYPES)
    used = {row["word"] for row in previous.values() if row["file"] in {p.name for p in images}}
    unused_words = [w for w in WORDS if w not in used]
    secrets.SystemRandom().shuffle(unused_words)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rows, written = [], set()
    for img in images:
        old = previous.get(img.name, {})
        token = old.get("token") or new_token()
        word = old.get("word") if old.get("word") in WORDS else None
        if not word:
            if not unused_words:
                sys.exit(f"Need more WORDS: {len(images)} guests, {len(WORDS)} words")
            word = unused_words.pop()
        name = guest_name(img)
        written.add(seal(token, name, word, img))
        link = f"{SITE}?k={token}"
        rows.append({"name": name, "link": link, "token": token, "word": word, "file": img.name})
        print(f"{name:28} {word}  {link}")

    # Remove files of guests whose image was taken out of the folder.
    for row in previous.values():
        file_id = derive(row["token"])[1]
        if file_id not in written:
            (OUT_DIR / f"{file_id}.bin").unlink(missing_ok=True)
            print(f"removed  {row['name']}")

    with links_csv.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    print(f"\n{len(rows)} invitations -> {OUT_DIR}\nLinks saved to {links_csv}")


if __name__ == "__main__":
    main()
