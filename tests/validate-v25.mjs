import { access, readFile } from 'node:fs/promises';

const mustExist=['apps/web/app/page.tsx','apps/web/app/design-system/page.tsx','apps/web/app/confianca/page.tsx','apps/web/lib/catalog.ts','apps/web/components/cover-art.tsx','apps/video/src/pill-explainer.tsx','content/audio/audio-manifest.json','scripts/audio-qc.mjs','scripts/audio-master.mjs','scripts/render-tts-openai.mjs'];
for(const file of mustExist){await access(file)}
const manifest=JSON.parse(await readFile('content/audio/audio-manifest.json','utf8'));
if(manifest.items.length!==20)throw new Error(`Manifesto deve ter 20 itens; recebeu ${manifest.items.length}`);
const ids=new Set(manifest.items.map(x=>x.id));if(ids.size!==20)throw new Error('IDs duplicados no manifesto');
const legacy=manifest.items.filter(x=>String(x.source).startsWith('legacy:'));if(legacy.length!==8)throw new Error(`Esperados 8 legados; recebeu ${legacy.length}`);
const scripts=['content/audio/scripts/pr-001-pr-005.md','content/audio/scripts/pr-006-pr-010.md','content/audio/scripts/pr-011-pr-015.md','content/audio/scripts/pr-016-pr-020.md'];
const all=(await Promise.all(scripts.map(x=>readFile(x,'utf8')))).join('\n');
for(let n=1;n<=20;n++){const id=`PR-${String(n).padStart(3,'0')}`;const count=(all.match(new RegExp(`## ${id}\\b`,'g'))||[]).length;if(count!==1)throw new Error(`${id}: esperado 1 roteiro, encontrado ${count}`)}
const catalog=await readFile('apps/web/lib/catalog.ts','utf8');for(let n=1;n<=20;n++){const id=`pr-${String(n).padStart(3,'0')}`;if(!catalog.includes(`id:'${id}'`))throw new Error(`${id} ausente do catálogo comercial`)}
const forbidden=['Transforme sua mente','Vença a insegurança','Assuma o controle:'];for(const term of forbidden){if(all.includes(term))throw new Error(`Copy legada proibida encontrada nos scripts: ${term}`)}
console.log('V2.5 structural gate: PASS — 20 conteúdos, 20 roteiros, 8 legados identificados.');
