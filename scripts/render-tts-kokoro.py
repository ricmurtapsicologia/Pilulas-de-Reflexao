#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from datetime import datetime, timezone

import numpy as np
import soundfile as sf
from kokoro import KPipeline

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / 'content' / 'audio' / 'scripts'
SOURCE = ROOT / 'media' / 'source'
MANIFEST = ROOT / 'data' / 'audio-v3.json'
FILES = [
    SCRIPTS / 'pr-001-pr-005.md',
    SCRIPTS / 'pr-006-pr-010.md',
    SCRIPTS / 'pr-011-pr-015.md',
    SCRIPTS / 'pr-016-pr-020.md',
]
RATE = 24000

SPEED = {
    'pr-007': 0.94,
    'pr-008': 0.96,
    'pr-012': 1.01,
    'pr-013': 0.87,
    'pr-014': 0.91,
    'pr-015': 0.94,
    'pr-017': 0.95,
    'pr-018': 0.93,
}

PAUSE = {
    'curta': 0.38,
    'normal': 0.78,
}


def read_script(pid: str) -> str:
    heading = f'## {pid.upper()}'
    for file in FILES:
        text = file.read_text(encoding='utf-8')
        start = text.find(heading)
        if start < 0:
            continue
        end = text.find('\n---', start + len(heading))
        section = text[start:end if end > start else None]
        marker = section.find('### Script')
        if marker < 0:
            raise RuntimeError(f'Marcador de script ausente em {pid}')
        return section[marker + len('### Script'):].strip()
    raise RuntimeError(f'Roteiro não encontrado: {pid}')


def split_with_pauses(text: str):
    text = re.sub(r'\[pausa de (\d+) segundos?\]', lambda m: f'<<PAUSE:{m.group(1)}>>', text, flags=re.I)
    text = re.sub(r'\[pausa curta\]', '<<PAUSE:0.38>>', text, flags=re.I)
    text = re.sub(r'\[pausa\]', '<<PAUSE:0.78>>', text, flags=re.I)
    text = re.sub(r'\[[^\]]+\]', '', text)
    parts = re.split(r'(<<PAUSE:[0-9.]+>>)', text)
    out = []
    for part in parts:
        part = part.strip()
        if not part:
            continue
        m = re.fullmatch(r'<<PAUSE:([0-9.]+)>>', part)
        if m:
            out.append(('pause', float(m.group(1))))
        else:
            spoken = re.sub(r'\s+', ' ', part).strip()
            if spoken:
                out.append(('speech', spoken))
    return out


def silence(seconds: float) -> np.ndarray:
    return np.zeros(max(1, int(RATE * seconds)), dtype=np.float32)


def synth_segment(pipeline: KPipeline, text: str, voice: str, speed: float) -> np.ndarray:
    chunks = []
    for _graphemes, _phonemes, audio in pipeline(text, voice=voice, speed=speed):
        arr = np.asarray(audio, dtype=np.float32)
        if arr.size:
            chunks.append(arr)
            chunks.append(silence(0.11))
    if not chunks:
        raise RuntimeError(f'Nenhum áudio gerado para trecho: {text[:80]}')
    return np.concatenate(chunks[:-1] if len(chunks) > 1 else chunks)


def render_one(pipeline: KPipeline, pid: str, voice: str) -> Path:
    raw = read_script(pid)
    items = split_with_pauses(raw)
    speed = SPEED.get(pid, 0.97)
    rendered = [silence(0.16)]

    for kind, value in items:
        if kind == 'pause':
            rendered.append(silence(float(value)))
        else:
            rendered.append(synth_segment(pipeline, str(value), voice, speed))

    rendered.append(silence(0.24))
    audio = np.concatenate(rendered)

    # Headroom técnico sem normalização destrutiva; loudness final é tratado no FFmpeg.
    peak = float(np.max(np.abs(audio))) if audio.size else 0.0
    if peak > 0.97:
        audio = audio * (0.94 / peak)

    SOURCE.mkdir(parents=True, exist_ok=True)
    out = SOURCE / f'{pid}-kokoro-{voice}.wav'
    sf.write(out, audio, RATE, subtype='PCM_24')
    print(json.dumps({'id': pid, 'voice': voice, 'speed': speed, 'source': str(out), 'seconds': len(audio) / RATE}, ensure_ascii=False))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('ids', nargs='+')
    ap.add_argument('--voice', default='pm_alex')
    args = ap.parse_args()

    for pid in args.ids:
        if not re.fullmatch(r'pr-\d{3}', pid):
            raise SystemExit(f'ID inválido: {pid}')

    pipeline = KPipeline(lang_code='p')
    for pid in args.ids:
        render_one(pipeline, pid, args.voice)


if __name__ == '__main__':
    main()
