#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const manifest = JSON.parse(await readFile('data/audio-v3.json', 'utf8'));
const entries = Object.entries(manifest.items || {});
if (!entries.length) {
  console.log('Nenhum master V3 publicado no manifesto.');
  process.exit(0);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = ''; let stderr = '';
    child.stdout.on('data', (data) => { stdout += data; });
    child.stderr.on('data', (data) => { stderr += data; });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(stderr.slice(-2000))));
  });
}

let failed = false;
for (const [id, item] of entries) {
  const file = (item.url || '').replace(/^\.\//, '');
  if (!file) { console.error(`${id}: URL ausente`); failed = true; continue; }
  try {
    const probe = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file]);
    const duration = Number(probe.stdout.trim());
    const loud = await run('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'loudnorm=I=-16:TP=-1:LRA=7:print_format=json', '-f', 'null', '-']);
    const match = loud.stderr.match(/\{\s*"input_i"[\s\S]*?\}/);
    const measured = match ? JSON.parse(match[0]) : null;
    const integrated = Number(measured?.input_i);
    const peak = Number(measured?.input_tp);
    const durationOk = duration >= 120 && duration <= 420;
    const loudnessOk = Number.isFinite(integrated) && integrated >= -17.5 && integrated <= -14.5;
    const peakOk = Number.isFinite(peak) && peak <= -0.5;
    const ok = durationOk && loudnessOk && peakOk;
    console.log(JSON.stringify({ id, duration: Math.round(duration), integratedLufs: integrated, truePeakDbtp: peak, ok }));
    if (!ok) failed = true;
  } catch (error) {
    console.error(`${id}: ${error.message}`); failed = true;
  }
}
if (failed) process.exit(1);
