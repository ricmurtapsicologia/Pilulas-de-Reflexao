#!/usr/bin/env node
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const id=process.argv[2];
if(!id){console.error('Uso: OPENAI_API_KEY=... node scripts/render-tts-openai.mjs pr-001');process.exit(2)}
const key=process.env.OPENAI_API_KEY; if(!key)throw new Error('OPENAI_API_KEY não configurada');
const model=process.env.OPENAI_TTS_MODEL||'tts-1-hd';
const voice=process.env.OPENAI_TTS_VOICE||'cedar';
const scriptsDir='content/audio/scripts'; const workDir=`media/work/${id}`; const sourceOut=`media/source/${id}-v2.5.wav`;
await mkdir(workDir,{recursive:true}); await mkdir('media/source',{recursive:true});

const files=['pr-001-pr-005.md','pr-006-pr-010.md','pr-011-pr-015.md','pr-016-pr-020.md'];
let markdown=''; for(const f of files){const x=await readFile(path.join(scriptsDir,f),'utf8');if(x.includes(`## ${id.toUpperCase()}`)){markdown=x;break}}
if(!markdown)throw new Error(`Roteiro ${id} não encontrado`);
const start=markdown.indexOf(`## ${id.toUpperCase()}`);const next=markdown.indexOf('\n---',start+4);const section=markdown.slice(start,next>start?next:undefined);const marker='### Script';const scriptRaw=section.slice(section.indexOf(marker)+marker.length).trim();
const clean=scriptRaw.replace(/\[[^\]]+\]/g,'').replace(/\n{3,}/g,'\n\n').trim();

function chunks(text,max=3700){const paras=text.split(/\n\n+/);const out=[];let current='';for(const p of paras){if((current+'\n\n'+p).length>max&&current){out.push(current.trim());current=p}else current+=(current?'\n\n':'')+p}if(current)out.push(current.trim());return out}
async function synth(text,file){const res=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model,voice,input:text,response_format:'wav',speed:1})});if(!res.ok)throw new Error(`TTS ${res.status}: ${await res.text()}`);await writeFile(file,Buffer.from(await res.arrayBuffer()))}
function run(cmd,args){return new Promise((resolve,reject)=>{const p=spawn(cmd,args,{stdio:'inherit'});p.on('error',reject);p.on('close',c=>c===0?resolve():reject(new Error(`${cmd} saiu com ${c}`)))})}
const parts=chunks(clean);const list=[];for(let i=0;i<parts.length;i++){const f=path.join(workDir,`part-${String(i+1).padStart(2,'0')}.wav`);console.log(`Renderizando ${id} bloco ${i+1}/${parts.length}`);await synth(parts[i],f);list.push(f)}
const concatFile=path.join(workDir,'concat.txt');await writeFile(concatFile,list.map(f=>`file '${path.resolve(f).replaceAll("'","'\\''")}'`).join('\n'));
await run('ffmpeg',['-y','-hide_banner','-f','concat','-safe','0','-i',concatFile,'-ar','48000','-c:a','pcm_s24le',sourceOut]);
console.log(`Fonte TTS criada: ${sourceOut}`);console.log(`Próximo passo: node scripts/audio-master.mjs ${sourceOut} ${id}`);
if(process.env.KEEP_TTS_PARTS!=='1')await rm(workDir,{recursive:true,force:true});
