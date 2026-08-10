import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { notFound } from 'next/navigation';
import { AudioPlayer } from '@/components/audio-player';
import { ClinicalVisual } from '@/components/clinical-visual';
import { CoverArt } from '@/components/cover-art';
import { FavoriteButton } from '@/components/favorite-button';
import { canAccess } from '@/lib/access';
import { getPill, getTrack, pills } from '@/lib/catalog';

export function generateStaticParams(){return pills.map(p=>({slug:p.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const p=getPill(slug);if(!p)return{};return{title:p.title,description:p.description,openGraph:{title:p.title,description:p.description}}}
function legacyUrl(file:string){return `https://ricmurtapsicologia.github.io/Pilulas-de-Reflexao/${encodeURIComponent(file).replace(/%2F/g,'/')}`}

export default async function PillPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params; const p=getPill(slug); if(!p)notFound(); const track=getTrack(p.track); const access=await canAccess(p.access);
  const audioSrc=access.allowed&&p.audioState==='master-approved'?`/api/media/${p.slug}`:(access.allowed&&p.access==='free'&&p.legacyAudio?legacyUrl(p.legacyAudio):null);
  const statusLabel=p.audioState==='master-approved'?'Master V2.5 aprovado':'Áudio legado em revisão editorial e sonora';
  return <main id="conteudo"><section className="section"><div className="shell"><Link className="btn btn-quiet" href="/#biblioteca"><ArrowLeft size={16}/> Biblioteca</Link><div className="page-grid" style={{marginTop:24}}><article className="article"><p className="eyebrow">{track?.name}</p><h1 className="section-title" style={{fontSize:'clamp(2.7rem,6vw,5rem)'}}>{p.title}</h1><p className="lede">{p.description}</p><div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'20px 0'}}><span className="badge">{p.skill}</span><span className="badge">{p.access==='free'?'Acesso livre':<><LockKeyhole size={12}/> Premium</>}</span><span className="badge">{p.audioState==='legacy-rewrite'?'Áudio legado em revisão':p.audioState==='master-approved'?'Master V2.5 aprovado':'Roteiro V2.5 aprovado'}</span></div>
  {!access.allowed?<section className="player-shell" aria-label="Conteúdo protegido"><strong>Esta pílula faz parte da biblioteca completa.</strong><p className="player-meta">A apresentação permanece pública; áudio, leitura completa e experiência são liberados pelo servidor conforme seu direito de acesso.</p><div className="hero-actions"><Link className="btn" href="/sign-in">Entrar</Link><Link className="btn" href="/pricing">Ver formas de acesso</Link></div></section>:<><div style={{display:'flex',justifyContent:'flex-end',marginBottom:10}}><FavoriteButton id={p.id}/></div>{audioSrc?<AudioPlayer id={p.id} title={p.title} src={audioSrc} statusLabel={statusLabel}/>:<div className="player-shell"><strong>{p.access==='free'?'Nova narração em produção':'Master premium em produção'}</strong><p className="player-meta" style={{marginBottom:0}}>{p.audioState==='legacy-rewrite'&&p.access!=='free'?'O MP3 histórico não será usado como mídia comercial porque permanece publicamente endereçável. O acesso sonoro retorna após a publicação do novo master privado.':'O roteiro V2.5 já está versionado. A mídia só será liberada após masterização e QC.'}</p></div>}<section style={{marginTop:36}}><p className="eyebrow">Leia em poucos minutos</p>{p.reading.map((x,i)=><p key={i}>{x}</p>)}</section><ClinicalVisual pill={p}/><aside className="reflection"><h3>Para refletir</h3><p>{p.reflection}</p></aside></>}
  <p className="muted" style={{fontSize:'.86rem',marginTop:28}}>Este conteúdo é psicoeducativo. Não realiza diagnóstico e não substitui avaliação ou acompanhamento individual quando necessário.</p></article><aside><div style={{aspectRatio:'1/1',borderRadius:28,overflow:'hidden'}}><CoverArt id={p.id} title={p.shortTitle} track={p.track}/></div><div className="aside-card" style={{marginTop:16}}><p className="eyebrow">Governança</p><p className="muted" style={{fontSize:'.9rem'}}>Conteúdo V2.5 · roteiro versionado · transcrição final será reconciliada com o master aprovado.</p></div></aside></div></div></section></main>;
}
