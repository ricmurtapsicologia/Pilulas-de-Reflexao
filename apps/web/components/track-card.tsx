import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { TrackId } from './glyphs';
import { TrackGlyph } from './glyphs';

export function TrackCard({id,name,description}:{id:TrackId;name:string;description:string}){
  return <article className="track-card">
    <div><div className="track-icon"><TrackGlyph track={id}/></div><h3>{name}</h3><p>{description}</p></div>
    <Link className="btn btn-quiet" href={`/?trilha=${id}#biblioteca`}>Explorar <ArrowUpRight size={15}/></Link>
  </article>;
}
