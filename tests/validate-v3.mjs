#!/usr/bin/env node
import { readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const fail = (message) => { console.error(`FAIL: ${message}`); process.exitCode = 1; };
const ok = (message) => console.log(`OK: ${message}`);

const catalog = JSON.parse(await readFile('data/pilulas.json', 'utf8'));
const extra = JSON.parse(await readFile('data/pilulas-v3-extra.json', 'utf8'));
const audio = JSON.parse(await readFile('data/audio-v3.json', 'utf8'));
const index = await readFile('index.html', 'utf8');

if ((catalog.items || []).length !== 20) fail('catálogo precisa conter 20 pílulas'); else ok('20 pílulas no catálogo');
const ids = new Set((catalog.items || []).map((item) => item.id));
if (ids.size !== 20) fail('IDs duplicados no catálogo'); else ok('IDs únicos');

for (const id of ids) {
  const entry = extra.items?.[id];
  if (!entry) { fail(`${id}: complemento V3 ausente`); continue; }
  if (!entry.takeaway || !entry.example) fail(`${id}: síntese ou exemplo ausente`);
  if (!entry.practice?.title || !Array.isArray(entry.practice?.steps) || entry.practice.steps.length < 3) fail(`${id}: prática precisa ter ao menos 3 passos`);
}
if (Object.keys(extra.items || {}).length === 20) ok('20 complementos editoriais V3');

const scriptFiles = ['pr-001-pr-005.md','pr-006-pr-010.md','pr-011-pr-015.md','pr-016-pr-020.md'];
let scripts = '';
for (const file of scriptFiles) scripts += `\n${await readFile(`content/audio/scripts/${file}`, 'utf8')}`;
for (const id of ids) if (!scripts.includes(`## ${id.toUpperCase()} `) && !scripts.includes(`## ${id.toUpperCase()} —`)) fail(`${id}: roteiro de áudio ausente`);
ok('roteiros encontrados para todas as pílulas');

for (const [id, item] of Object.entries(audio.items || {})) {
  if (!ids.has(id)) fail(`${id}: áudio fora do catálogo`);
  if (!item.url?.startsWith('./assets/audio/')) fail(`${id}: URL V3 inválida`);
  if (item.url) {
    try { await access(item.url.replace(/^\.\//, '')); } catch { fail(`${id}: manifesto aponta para arquivo inexistente`); }
  }
}
ok('manifesto de áudio sem links fictícios');

for (const required of ['./assets/css/v3.css?v=3.0.0','./assets/js/app.js?v=3.0.0']) if (!index.includes(required)) fail(`index não referencia ${required}`);
ok('assets V3 com cache busting');

const jsCheck = spawnSync(process.execPath, ['--check', 'assets/js/app.js'], { encoding: 'utf8' });
if (jsCheck.status !== 0) fail(`app.js inválido: ${jsCheck.stderr}`); else ok('sintaxe JavaScript válida');

if (process.exitCode) process.exit(process.exitCode);
console.log('V3 validada estruturalmente.');
