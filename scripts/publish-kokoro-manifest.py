#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / 'assets' / 'audio'
MANIFEST = ROOT / 'data' / 'audio-v3.json'
VOICE = 'pm_alex'
MODEL = 'hexgrad/Kokoro-82M'


def duration(path: Path) -> float:
    out = subprocess.check_output([
        'ffprobe','-v','error','-show_entries','format=duration',
        '-of','default=noprint_wrappers=1:nokey=1',str(path)
    ], text=True).strip()
    return round(float(out), 1)


def main():
    items = {}
    for n in range(1, 21):
        pid = f'pr-{n:03d}'
        mp3 = AUDIO / f'{pid}-v3.mp3'
        wav = AUDIO / f'{pid}-v3.wav'
        if not mp3.exists() or not wav.exists():
            raise SystemExit(f'Master ausente: {pid}')
        items[pid] = {
            'url': f'./assets/audio/{pid}-v3.mp3',
            'masterWav': f'./assets/audio/{pid}-v3.wav',
            'duration': f'{round(duration(mp3) / 60, 1)} min',
            'seconds': duration(mp3),
            'provider': 'kokoro-open-weight',
            'model': MODEL,
            'voice': VOICE,
            'language': 'pt-BR',
            'qcStatus': 'technical-approved'
        }

    manifest = {
        'version': '3.0.0',
        'provider': 'kokoro-open-weight',
        'model': MODEL,
        'voice': VOICE,
        'language': 'pt-BR',
        'generatedAt': datetime.now(timezone.utc).isoformat(),
        'items': items
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Manifesto atualizado: {len(items)} masters')


if __name__ == '__main__':
    main()
