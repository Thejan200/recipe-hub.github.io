#!/usr/bin/env python3
"""Validate BiteSparks favicon and web app icon integration."""

from __future__ import annotations

import json
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "site.webmanifest"

REQUIRED_FILES = {
    "favicon.ico",
    "favicon.svg",
    "apple-touch-icon.png",
    "icon-192.png",
    "icon-512.png",
    "maskable-icon-512.png",
}

PNG_DIMENSIONS = {
    "apple-touch-icon.png": (180, 180),
    "icon-192.png": (192, 192),
    "icon-512.png": (512, 512),
    "maskable-icon-512.png": (512, 512),
}

EXPECTED_MANIFEST_ICONS = {
    "favicon.svg": {"sizes": "any", "type": "image/svg+xml", "purpose": "any"},
    "icon-192.png": {"sizes": "192x192", "type": "image/png", "purpose": "any"},
    "icon-512.png": {"sizes": "512x512", "type": "image/png", "purpose": "any"},
    "maskable-icon-512.png": {"sizes": "512x512", "type": "image/png", "purpose": "maskable"},
}

FORBIDDEN_OLD_FILES = {"icon-maskable-512.png"}


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def png_dimensions(path: Path) -> tuple[int, int]:
    data = path.read_bytes()
    if len(data) < 24 or data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
        fail(f"{path.name} is not a valid PNG with an IHDR header")
    return struct.unpack(">II", data[16:24])


def main() -> None:
    for filename in sorted(REQUIRED_FILES):
        path = ROOT / filename
        if not path.is_file():
            fail(f"Missing required favicon asset: {filename}")
        if path.stat().st_size == 0:
            fail(f"Favicon asset is empty: {filename}")

    for filename in sorted(FORBIDDEN_OLD_FILES):
        if (ROOT / filename).exists():
            fail(f"Legacy favicon filename must not return: {filename}")

    for filename, expected in PNG_DIMENSIONS.items():
        actual = png_dimensions(ROOT / filename)
        if actual != expected:
            fail(f"{filename} dimensions are {actual[0]}x{actual[1]}, expected {expected[0]}x{expected[1]}")

    try:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"Unable to read valid site.webmanifest: {exc}")

    for key in ("id", "start_url", "scope"):
        if manifest.get(key) != "./":
            fail(f"site.webmanifest {key!r} must be './'")

    icons = manifest.get("icons")
    if not isinstance(icons, list):
        fail("site.webmanifest icons must be a list")

    by_src = {}
    for icon in icons:
        if not isinstance(icon, dict) or not isinstance(icon.get("src"), str):
            fail("Every manifest icon must be an object with a string src")
        src = icon["src"]
        if src in by_src:
            fail(f"Duplicate manifest icon src: {src}")
        by_src[src] = icon

    if set(by_src) != set(EXPECTED_MANIFEST_ICONS):
        missing = sorted(set(EXPECTED_MANIFEST_ICONS) - set(by_src))
        extra = sorted(set(by_src) - set(EXPECTED_MANIFEST_ICONS))
        fail(f"Manifest icon set mismatch; missing={missing}, extra={extra}")

    for src, expected_fields in EXPECTED_MANIFEST_ICONS.items():
        icon = by_src[src]
        for field, expected_value in expected_fields.items():
            if icon.get(field) != expected_value:
                fail(
                    f"Manifest icon {src!r} field {field!r} is {icon.get(field)!r}, "
                    f"expected {expected_value!r}"
                )
        if not (ROOT / src).is_file():
            fail(f"Manifest icon reference is broken: {src}")

    print("BiteSparks favicon validation passed.")


if __name__ == "__main__":
    main()
