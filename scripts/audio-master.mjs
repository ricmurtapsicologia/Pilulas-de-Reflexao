#!/usr/bin/env node
import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const input = process.argv[2];
const id = process.argv[3];
const outDir = process.argv[4] || 'assets/audio';
if (!input || !id) {
  console.error('Uso: node scripts/audio-master.mjs <source.wav> <pr-001> [assets/audio]');
  process.exit(2);
}
await mkdir(outDir, { recursive: true });

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (data) => { stderr += data; });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve(stderr) : reject(new Error(stderr.slice(-2000))));
  });
}

const pass1 = await run(['-hide_banner', '-nostats', '-i', input, '-af', 'loudnorm=I=-16:TP=-1:LRA=7:print_format=json', '-f', 'null', '-']);
const match = pass1.match(/\{\s*"input_i"[\s\S]*?\}/);
if (!match) throw new Error('Medição loudnorm ausente');
const measured = JSON.parse(match[0]);
const filter = `loudnorm=I=-16:TP=-1:LRA=7:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true:print_format=summary`;
const wav = path.join(outDir, `${id}-v3.wav`);
const mp3 = path.join(outDir, `${id}-v3.mp3`);

await run(['-y', '-hide_banner', '-i', input, '-af', filter, '-ar', '48000', '-c:a', 'pcm_s24le', wav]);
await run(['-y', '-hide_banner', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '128k', '-ar', '48000', mp3]);
console.log(JSON.stringify({ id, input, wav, mp3, target: { integratedLufs: -16, truePeakDbtp: -1, lra: 7 } }, null, 2));
