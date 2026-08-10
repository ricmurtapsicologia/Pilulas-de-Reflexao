import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CoverArt } from './cover-art';
import type { TrackId } from './glyphs';

export function CampaignBanner({eyebrow,title,copy,href,label,track='regulacao',seed='campaign'}:{eyebrow:string;title:string;copy:string;href:string;label:string;track?:TrackId;seed?:string}){
  return <section className="feature" aria-label={title}><div><p className="eyebrow" style={{color:'#dfe9e5'}}>{eyebrow}</p><h2 className="section-title">{title}</h2><p className="muted">{copy}</p><div className="hero-actions"><Link className="btn" href={href}>{label}<ArrowRight size={16}/></Link></div></div><div style={{minHeight:220,borderRadius:22,overflow:'hidden'}}><CoverArt id={seed} track={track} variant="hero"/></div></section>;
}
