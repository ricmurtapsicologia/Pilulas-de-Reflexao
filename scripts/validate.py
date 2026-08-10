from __future__ import annotations

import json
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data" / "pilulas.json"
REQUIRED = {"id", "slug", "title", "track", "skill", "duration", "format", "status", "description", "reading", "reflection"}


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    if not CATALOG.exists():
        fail("data/pilulas.json não encontrado")

    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    tracks = {track["id"] for track in data.get("tracks", [])}
    items = data.get("items", [])

    if not items:
        fail("catálogo sem itens")

    ids: set[str] = set()
    slugs: set[str] = set()

    for item in items:
        missing = REQUIRED - set(item)
        if missing:
            fail(f"{item.get('id', '<sem id>')} sem campos: {sorted(missing)}")
        if item["id"] in ids:
            fail(f"id duplicado: {item['id']}")
        if item["slug"] in slugs:
            fail(f"slug duplicado: {item['slug']}")
        if item["track"] not in tracks:
            fail(f"trilha inexistente em {item['id']}: {item['track']}")
        if not isinstance(item["reading"], list) or not item["reading"]:
            fail(f"{item['id']} precisa de leitura editorial")

        ids.add(item["id"])
        slugs.add(item["slug"])

        audio_url = item.get("audioUrl")
        if audio_url and audio_url.startswith("./"):
            audio_path = ROOT / unquote(audio_url[2:])
            if not audio_path.exists():
                fail(f"arquivo de áudio ausente para {item['id']}: {audio_path.name}")

    for need in data.get("needs", []):
        for item_id in need.get("items", []):
            if item_id not in ids:
                fail(f"necessidade {need.get('id')} referencia item inexistente: {item_id}")

    print(f"OK: {len(items)} pílulas, {len(tracks)} trilhas, IDs e referências válidos.")


if __name__ == "__main__":
    main()
