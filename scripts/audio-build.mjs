#!/usr/bin/env node
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const allIds = Array.from({ length: 20 }, (_, index) => `pr-${String(index + 1).padStart(3, '0')}`);
const args = process.argv.slice(2);
const requested = args.filter((value) => /^pr-\d{3}$/.test(value));
const all = args.includes('--all');
const confirm = args.includes('--confirm-cost');
if (all && !confirm) {
  console.error('Para renderizar as 20 pílulas, use --all --confirm-cost.');
  process.exit(2);
}
const ids = all ? allIds : requested;
if (!ids.length) {
  console.error('Uso: node scripts/audio-build.mjs pr-001 [pr-002...] OU --all --confirm-cost');
  process.exit(2);
}
if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY não configurada');
for (const id of ids) if (!allIds.includes(id)) throw new Error(`${id} fora do catálogo V3`);

function run(command, argv) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, argv, { stdio: 'inherit', env: process.env });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`${command} ${argv.join(' ')} saiu com ${code}`)));
  });
}

function capture(command, argv) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, argv, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = ''; let stderr = '';
    child.stdout.on('data', (data) => { stdout += data; });
    child.stderr.on('data', (data) => { stderr += data; });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve(stdout) : reject(new Error(stderr.slice(-1600))));
  });
}

const manifestPath = 'data/audio-v3.json';
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
manifest.provider = 'openai';
manifest.model = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
manifest.voice = process.env.OPENAI_TTS_VOICE || 'cedar';
manifest.items ||= {};

for (const id of ids) {
  console.log(`\n=== ${id}: síntese neural ===`);
  await run(process.execPath, ['scripts/render-tts-openai.mjs', id]);
  console.log(`=== ${id}: masterização ===`);
  await run(process.execPath, ['scripts/audio-master.mjs', `media/source/${id}-v3.wav`, id]);
  const mp3 = `assets/audio/${id}-v3.mp3`;
  const rawDuration = await capture('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', mp3]);
  const seconds = Math.round(Number(rawDuration.trim()));
  manifest.items[id] = {
    url: `./${mp3}`,
    seconds,
    duration: `${Math.max(1, Math.round(seconds / 60))} min`,
    generatedAt: new Date().toISOString(),
    qc: 'pending'
  };
  try { await unlink(`assets/audio/${id}-v3.wav`); } catch {}
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log('\n=== QC ===');
await run(process.execPath, ['scripts/audio-qc.mjs']);
for (const id of ids) manifest.items[id].qc = 'passed';
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\n${ids.length} áudio(s) V3 gerado(s), masterizado(s) e aprovado(s) no QC técnico.`);
