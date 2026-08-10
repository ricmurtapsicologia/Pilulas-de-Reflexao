import Link from 'next/link';
import { ArrowRight, LockKeyhole, Play } from 'lucide-react';
import type { Pill } from '@/lib/catalog';
import { getTrack } from '@/lib/catalog';
import { CoverArt } from './cover-art';

export function PillCard({pill}: {pill:Pill}) {
  const track=getTrack(pill.track);
  return <article className="pill-card">
    <div className="pill-art-strip"><CoverArt id={pill.id} track={pill.track} variant="strip"/></div>
    <div className="pill-card-head"><span className="pill-tag">{track?.name}</span><span className="badge">{pill.access==='free'?'Livre':<><LockKeyhole size={12}/> Premium</>}</span></div>
    <h3>{pill.title}</h3>
    <p>{pill.description}</p>
    <div className="pill-meta"><span>{pill.skill}</span><span>·</span><span>{pill.audioState==='legacy-rewrite'?'áudio em revisão':'roteiro V2.5'}</span></div>
    <Link className="btn btn-quiet" href={`/pilulas/${pill.slug}`}>{pill.legacyAudio||pill.audioState==='master-approved'?<Play size={16}/>:null} Abrir <ArrowRight size={15}/></Link>
  </article>;
}
