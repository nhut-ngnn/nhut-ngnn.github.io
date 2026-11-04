"""Encrypt personalized graduation invitations for the /invitation/ page.

Each guest gets a secret sequence of 5 icons, which they tap on the page's
icon board to unlock. The sequence (stored as letters, e.g. "ADKPB") is
stretched with PBKDF2 into an AES-256-GCM key plus a file id, so the published
files reveal neither the guest's name nor the image without the code.

Each guest also gets a unique 5-letter word for the word game inside their
invitation; it is encrypted together with the name and image.

Usage:
    python bin/encrypt_invitations.py "<images dir>" [codes.csv]

Codes are kept in codes.csv (default: next to the images dir, NOT in the repo)
and reused on re-runs, so previously sent codes keep working.
"""

import csv
import hashlib
import json
import os
import secrets
import struct
import sys
from pathlib import Path

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# Must match assets/js/invitation.js
SALT = b"nhut-ngnn-graduation-invitation"
ITERATIONS = 250_000
# Icon board, in order; letter A = first icon. Must match ICONS in assets/js/invitation.js
ICONS = [
    ("🎓", "cap"), ("📚", "books"), ("🎉", "party"), ("🌸", "flower"),
    ("📷", "camera"), ("☕", "coffee"), ("🎸", "guitar"), ("⭐", "star"),
    ("🍀", "clover"), ("🚀", "rocket"), ("🎨", "palette"), ("🌙", "moon"),
    ("🍕", "pizza"), ("🏆", "trophy"), ("💡", "bulb"), ("🎵", "music"),
]
LETTERS = "ABCDEFGHIJKLMNOP"
CODE_LENGTH = 5

# Secret words for the word game, one per guest (5 letters each)
WORDS = [
    "PARTY", "SMILE", "DREAM", "PROUD", "CHEER", "HAPPY", "TOAST", "BRAVE",
    "SHINE", "MAGIC", "PHOTO", "LAUGH", "HEART", "MUSIC", "GRADE", "STUDY",
    "CLASS", "BLOOM", "LUCKY", "HONOR", "YOUTH", "QUEST",
    "UNITY", "GLORY", "MERRY", "SUNNY", "TRUST", "SPARK",
]

REPO = Path(__file__).resolve().parent.parent
OUT_DIR = REPO / "assets" / "invitations"


def new_code():
    return "".join(secrets.choice(LETTERS) for _ in range(CODE_LENGTH))


def is_valid(code):
    return len(code) == CODE_LENGTH and all(c in LETTERS for c in code)


def to_icons(code):
    return " ".join(ICONS[LETTERS.index(c)][0] for c in code)


def to_words(code):
    return ", ".join(ICONS[LETTERS.index(c)][1] for c in code)


def normalize(code):
    return "".join(c for c in code.upper() if c.isalnum())


def derive(code):
    material = hashlib.pbkdf2_hmac("sha256", normalize(code).encode(), SALT, ITERATIONS, dklen=64)
    return material[:32], material[32:48].hex()


def guest_name(path):
    stem = path.stem.removeprefix("Graduation_Invitation_")
    return stem.replace("_", " ")


def main():
    images_dir = Path(sys.argv[1])
    codes_csv = Path(sys.argv[2]) if len(sys.argv) > 2 else images_dir.parent / "invitation_codes.csv"

    codes, words = {}, {}
    if codes_csv.exists():
        with codes_csv.open(newline="", encoding="utf-8-sig") as f:
            previous = list(csv.DictReader(f))
        codes = {row["file"]: row["code"] for row in previous if is_valid(row["code"])}
        words = {row["file"]: row["word"] for row in previous if row.get("word") in WORDS}

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("*.bin"):
        old.unlink()

    rows = []
    images = sorted(images_dir.glob("*.png"))
    unused_words = [w for w in WORDS if w not in words.values()]
    secrets.SystemRandom().shuffle(unused_words)
    if len(images) > len(words) + len(unused_words):
        sys.exit(f"Need more WORDS: {len(images)} guests, {len(WORDS)} words")
    for img in images:
        code = codes.get(img.name) or new_code()
        word = words.get(img.name) or unused_words.pop()
        name = guest_name(img)
        key, file_id = derive(code)

        meta = json.dumps({"name": name, "word": word}).encode("utf-8")
        payload = struct.pack(">H", len(meta)) + meta + img.read_bytes()
        iv = os.urandom(12)
        (OUT_DIR / f"{file_id}.bin").write_bytes(iv + AESGCM(key).encrypt(iv, payload, None))

        rows.append({"name": name, "icons": to_icons(code), "words": to_words(code), "code": code, "word": word, "file": img.name})
        print(f"{name:26} {code}  {word}  {to_words(code)}")

    with codes_csv.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=["name", "icons", "words", "code", "word", "file"])
        writer.writeheader()
        writer.writerows(rows)
    print(f"\n{len(rows)} invitations -> {OUT_DIR}\nCodes saved to {codes_csv}")


if __name__ == "__main__":
    main()
