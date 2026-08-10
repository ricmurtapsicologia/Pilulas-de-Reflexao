#!/usr/bin/env node
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const id = process.argv[2];
if (!id || !/^pr-\d{3}$/.test(id)) {
  console.error('Uso: OPENAI_API_KEY=... node scripts/render-tts-openai.mjs pr-001');
  process.exit(2);
}

const key = process.env.OPENAI_API_KEY;
if (!key) throw new Error('OPENAI_API_KEY não configurada');

const model = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
const voice = process.env.OPENAI_TTS_VOICE || 'cedar';
const scriptsDir = 'content/audio/scripts';
const workDir = `media/work/${id}`;
const sourceOut = `media/source/${id}-v3.wav`;

const files = ['pr-001-pr-005.md', 'pr-006-pr-010.md', 'pr-011-pr-015.md', 'pr-016-pr-020.md'];
const direction = {
  'pr-001': 'reflexiva, precisa e conversacional',
  'pr-002': 'didática, clara e sem tom de aula',
  'pr-003': 'calma, firme e não confrontativa',
  'pr-004': 'reflexiva, com pausas naturais entre perguntas',
  'pr-005': 'segura, sóbria e tolerante à ambiguidade',
  'pr-006': 'didática, tranquila e sem dramatizar sinais corporais',
  'pr-007': 'acolhedora, estável e sem sentimentalização',
  'pr-008': 'firme, centrada e progressivamente desacelerada',
  'pr-009': 'encorajadora sem soar motivacional',
  'pr-010': 'prática, curiosa e orientada a experimento',
  'pr-011': 'didática e cuidadosa, sem linguagem de desafio',
  'pr-012': 'ligeiramente mais dinâmica, objetiva e leve',
  'pr-013': 'lenta, permissiva e espaçada; respeite pausas longas',
  'pr-014': 'calma, concreta e sensorial',
  'pr-015': 'firme e pausada, enfatizando escolha',
  'pr-016': 'conversacional, contemporânea e sem julgamento',
  'pr-017': 'contemplativa sem melancolia',
  'pr-018': 'desacelerada, cotidiana e sóbria',
  'pr-019': 'reflexiva, clara e com leve sensação de direção',
  'pr-020': 'responsável, humana e sem tom de autoajuda'
}[id] || 'natural, conversacional e sóbria';

await mkdir(workDir, { recursive: true });
await mkdir('media/source', { recursive: true });

let markdown = '';
for (const file of files) {
  const candidate = await readFile(path.join(scriptsDir, file), 'utf8');
  if (candidate.includes(`## ${id.toUpperCase()} `) || candidate.includes(`## ${id.toUpperCase()} —`)) {
    markdown = candidate;
    break;
  }
}
if (!markdown) throw new Error(`Roteiro ${id} não encontrado`);

const heading = `## ${id.toUpperCase()}`;
const start = markdown.indexOf(heading);
const next = markdown.indexOf('\n---', start + heading.length);
const section = markdown.slice(start, next > start ? next : undefined);
const marker = '### Script';
const markerIndex = section.indexOf(marker);
if (markerIndex < 0) throw new Error(`Marcador de script ausente em ${id}`);

const raw = section.slice(markerIndex + marker.length).trim();
const clean = raw
  .replace(/\[pausa de (\d+) segundos?\]/gi, (_m, seconds) => `. ${'… '.repeat(Math.max(1, Math.min(6, Number(seconds))))}`)
  .replace(/\[pausa curta\]/gi, '…')
  .replace(/\[pausa\]/gi, '……')
  .replace(/\[[^\]]+\]/g, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

function chunks(text, max = 3600) {
  const paragraphs = text.split(/\n\n+/);
  const out = [];
  let current = '';
  for (const paragraph of paragraphs) {
    if ((current + '\n\n' + paragraph).length > max && current) {
      out.push(current.trim());
      current = paragraph;
    } else current += (current ? '\n\n' : '') + paragraph;
  }
  if (current) out.push(current.trim());
  return out;
}

async function synth(text, file) {
  const instructions = `Fale em português do Brasil. Voz adulta, natural, próxima e profissional. Entonação humana, sem cadência publicitária, sem locução de rádio e sem entusiasmo artificial. Varie discretamente ritmo e intensidade conforme o sentido. Dicção clara, mas não excessivamente articulada. Preserve silêncio entre ideias importantes. Direção específica desta pílula: ${direction}. Não acrescente palavras ao roteiro.`;
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, voice, input: text, instructions, response_format: 'wav', speed: 1 })
  });
  if (!response.ok) throw new Error(`TTS ${response.status}: ${await response.text()}`);
  await writeFile(file, Buffer.from(await response.arrayBuffer()));
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`${command} saiu com ${code}`)));
  });
}

const parts = chunks(clean);
const rendered = [];
for (let index = 0; index < parts.length; index += 1) {
  const file = path.join(workDir, `part-${String(index + 1).padStart(2, '0')}.wav`);
  console.log(`Renderizando ${id} bloco ${index + 1}/${parts.length} com ${model}/${voice}`);
  await synth(parts[index], file);
  rendered.push(file);
}

const concatFile = path.join(workDir, 'concat.txt');
await writeFile(concatFile, rendered.map((file) => `file '${path.resolve(file).replaceAll("'", "'\\''")}'`).join('\n'));
await run('ffmpeg', ['-y', '-hide_banner', '-f', 'concat', '-safe', '0', '-i', concatFile, '-ar', '48000', '-c:a', 'pcm_s24le', sourceOut]);
console.log(`Fonte criada: ${sourceOut}`);
if (process.env.KEEP_TTS_PARTS !== '1') await rm(workDir, { recursive: true, force: true });
