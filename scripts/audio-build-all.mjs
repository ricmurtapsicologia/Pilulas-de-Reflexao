#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const args=process.argv.slice(2);const manifest=JSON.parse(await readFile('content/audio/audio-manifest.json','utf8'));
const requested=args.filter(x=>/^pr-\d{3}$/.test(x));const all=args.includes('--all');const confirm=args.includes('--confirm-cost');
if(all&&!confirm){console.error('Para renderizar os 20 áudios, use --all --confirm-cost. Isso evita chamadas TTS em lote por engano.');process.exit(2)}
const ids=all?manifest.items.map(x=>x.id):requested;
if(!ids.length){console.error('Uso: node scripts/audio-build-all.mjs pr-001 [pr-002...] OU --all --confirm-cost');process.exit(2)}
if(!process.env.OPENAI_API_KEY)throw new Error('OPENAI_API_KEY não configurada');
function run(cmd,argv){return new Promise((resolve,reject)=>{const p=spawn(cmd,argv,{stdio:'inherit',env:process.env});p.on('error',reject);p.on('close',c=>c===0?resolve():reject(new Error(`${cmd} ${argv.join(' ')} saiu com ${c}`)))})}
for(const id of ids){if(!manifest.items.some(x=>x.id===id))throw new Error(`${id} não existe no manifesto`);console.log(`\n=== ${id}: render TTS ===`);await run(process.execPath,['scripts/render-tts-openai.mjs',id]);console.log(`=== ${id}: master ===`);await run(process.execPath,['scripts/audio-master.mjs',`media/source/${id}-v2.5.wav`,id]);}
console.log('\n=== QC do conjunto disponível ===');await run(process.execPath,['scripts/audio-qc.mjs']);
