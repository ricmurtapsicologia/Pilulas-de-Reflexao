import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { notFound } from 'next/navigation';
import { AudioPlayer } from '@/components/audio-player';
import { CoverArt } from '@/components/cover-art';
import { getPill, getTrack, pills } from '@/lib/catalog';

export function generateStaticParams(){return pills.map(p=>({slug:p.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const p=getPill(slug);if(!p)return{};return{title:p.title,description:p.description,openGraph:{title:p.title,description:p.description}}}

function legacyUrl(file:string){return `https://ricmurtapsicologia.github.io/Pilulas-de-Reflexao/${encodeURIComponent(file).replace(/%2F/g,'/')}`}

export default async function PillPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params; const p=getPill(slug); if(!p)notFound(); const track=getTrack(p.track);
  return <main id="conteudo"><section className="section"><div className="shell"><Link className="btn btn-quiet" href="/#biblioteca"><ArrowLeft size={16}/> Biblioteca</Link><div className="page-grid" style={{marginTop:24}}><article className="article"><p className="eyebrow">{track?.name}</p><h1 className="section-title" style={{fontSize:'clamp(2.7rem,6vw,5rem)'}}>{p.title}</h1><p className="lede">{p.description}</p><div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'20px 0'}}><span className="badge">{p.skill}</span><span className="badge">{p.access==='free'?'Acesso livre':<><LockKeyhole size={12}/> Premium</>}</span><span className="badge">{p.audioState==='legacy-rewrite'?'Áudio em revisão':'Roteiro V2.5 aprovado'}</span></div>{p.legacyAudio?<AudioPlayer id={p.id} title={p.title} src={legacyUrl(p.legacyAudio)}/>:<div className="player-shell"><strong>Nova narração em produção</strong><p className="player-meta" style={{marginBottom:0}}>O roteiro V2.5 já está versionado. A mídia só será liberada após masterização e QC.</p></div>}<section style={{marginTop:36}}><p className="eyebrow">Leia em poucos minutos</p>{p.reading.map((x,i)=><p key={i}>{x}</p>)}</section><aside className="reflection"><h3>Para refletir</h3><p>{p.reflection}</p></aside><p className="muted" style={{fontSize:'.86rem'}}>Este conteúdo é psicoeducativo. Não realiza diagnóstico e não substitui avaliação ou acompanhamento individual quando necessário.</p></article><aside><div style={{aspectRatio:'1/1',borderRadius:28,overflow:'hidden'}}><CoverArt id={p.id} title={p.shortTitle} track={p.track}/></div><div className="aside-card" style={{marginTop:16}}><p className="eyebrow">Governança</p><p className="muted" style={{fontSize:'.9rem'}}>Conteúdo V2.5 · roteiro versionado · transcrição final será reconciliada com o master aprovado.</p></div></aside></div></div></section></main>;
}
