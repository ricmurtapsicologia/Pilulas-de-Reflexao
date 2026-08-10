#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const root=process.cwd();
const manifestPath=process.argv[2]||path.join(root,'content/audio/audio-manifest.json');
const mediaDir=process.argv[3]||path.join(root,'media/masters');
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));

function run(cmd,args){return new Promise((resolve,reject)=>{const p=spawn(cmd,args,{stdio:['ignore','pipe','pipe']});let out='',err='';p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);p.on('error',reject);p.on('close',code=>code===0?resolve({out,err}):reject(new Error(`${cmd} saiu com ${code}: ${err.slice(-1200)}`)))});}

async function probe(file){const {out}=await run('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_name,sample_rate,channels','-of','json',file]);return JSON.parse(out)}
async function loudness(file){const {err}=await run('ffmpeg',['-hide_banner','-nostats','-i',file,'-af','loudnorm=I=-16:TP=-1:LRA=7:print_format=json','-f','null','-']);const match=err.match(/\{\s*"input_i"[\s\S]*?\}/);if(!match)throw new Error('Não foi possível extrair loudness');return JSON.parse(match[0])}
async function silence(file){const {err}=await run('ffmpeg',['-hide_banner','-nostats','-i',file,'-af','silencedetect=noise=-45dB:d=1.5','-f','null','-']);return [...err.matchAll(/silence_duration: ([0-9.]+)/g)].map(m=>Number(m[1]))}

let failures=0; const results=[];
for(const item of manifest.items){
  const file=path.join(mediaDir,item.output);
  try{
    await stat(file); const p=await probe(file); const l=await loudness(file); const sil=await silence(file); const duration=Number(p.format?.duration||0); const inputI=Number(l.input_i); const inputTp=Number(l.input_tp); const issues=[];
    if(!duration||duration<45)issues.push('duração inesperadamente curta');
    if(Math.abs(inputI-(-16))>1.2)issues.push(`loudness ${inputI} LUFS fora do alvo`);
    if(inputTp>-0.8)issues.push(`true peak ${inputTp} dBTP acima do limite`);
    if(sil.some(x=>x>4))issues.push('silêncio interno > 4 s');
    if(issues.length)failures++;
    results.push({id:item.id,file:item.output,duration:Math.round(duration),inputI,inputTp,issues,status:issues.length?'FAIL':'PASS'});
  }catch(error){failures++;results.push({id:item.id,file:item.output,status:'MISSING_OR_ERROR',issues:[error instanceof Error?error.message:String(error)]});}
}
console.table(results.map(({id,file,status,duration,inputI,inputTp})=>({id,file,status,duration,inputI,inputTp})));
for(const r of results.filter(x=>x.issues?.length))console.error(`${r.id}: ${r.issues.join('; ')}`);
if(failures){console.error(`\nQC falhou em ${failures}/${manifest.items.length} itens.`);process.exit(1)}
console.log(`\nQC aprovado: ${manifest.items.length}/${manifest.items.length} itens.`);
