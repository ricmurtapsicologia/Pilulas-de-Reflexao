import { stableHash } from '@/lib/utils';
import { TrackGlyph, type TrackId } from './glyphs';

const trackNames:Record<TrackId,string>={pensamentos:'Pensamentos',emocoes:'Emoções',acao:'Ação',regulacao:'Presença',autoconhecimento:'Autoconhecimento',cotidiano:'Vida cotidiana'};
const palettes:Record<TrackId,[string,string,string]>={
  pensamentos:['#dfe9e5','#9fb8af','#355c54'],
  emocoes:['#ebe3e7','#b9aab3','#685b64'],
  acao:['#e7e7dc','#b7b99c','#5e6249'],
  regulacao:['#e0e8e9','#a8bdc0','#52656a'],
  autoconhecimento:['#ebe6dd','#c1b49e','#6a5e4d'],
  cotidiano:['#e7e7e5','#b8b9b9','#5d5e61'],
};

type Props={id:string;title?:string;track:TrackId;variant?:'cover'|'strip'|'hero';className?:string};

export function CoverArt({id,title,track,variant='cover',className=''}:Props){
  const seed=stableHash(id); const [soft,mid,dark]=palettes[track];
  const p=[0,1,2,3,4].map((i)=>({
    x:8+((seed>>(i*3))%72), y:8+((seed>>(i*4+1))%72), r:18+((seed>>(i*2+2))%24), rot:(seed>>(i+2))%120,
  }));
  const number=(Number(id.replace(/\D/g,''))||0).toString().padStart(2,'0');
  const isStrip=variant==='strip';
  return <div className={`cover ${className}`} style={{width:'100%',height:'100%',background:`linear-gradient(145deg,${soft},#fffdf9)`}} aria-hidden={isStrip?true:undefined}>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}} aria-hidden="true">
      <defs><filter id={`blur-${id}`}><feGaussianBlur stdDeviation="3.8"/></filter></defs>
      {p.map((v,i)=><ellipse key={i} cx={v.x} cy={v.y} rx={v.r} ry={Math.max(10,v.r*.42)} transform={`rotate(${v.rot} ${v.x} ${v.y})`} fill={i%2?mid:dark} opacity={i===0?.16:.10+(i*.018)} filter={`url(#blur-${id})`}/>) }
      <path d={`M-8 ${58+(seed%14)} C 16 ${24+(seed%16)}, 42 ${82-(seed%20)}, 108 ${30+(seed%25)}`} fill="none" stroke={dark} strokeWidth=".8" opacity=".35"/>
      <path d={`M-5 ${72-(seed%10)} C 30 ${50+(seed%12)}, 66 ${44-(seed%8)}, 110 ${68-(seed%16)}`} fill="none" stroke={mid} strokeWidth="1.2" opacity=".38"/>
    </svg>
    <div style={{position:'absolute',right:'7%',bottom:'8%',width:isStrip?34:52,height:isStrip?34:52,color:dark,opacity:.72}}><TrackGlyph track={track}/></div>
    {!isStrip&&variant!=='hero'&&<><span className="cover-label">{trackNames[track]}</span><span className="cover-number">{number}</span>{title&&<div className="cover-title">{title}</div>}</>}
  </div>;
}

export function HeroArt(){
  return <div className="hero-art" aria-hidden="true">
    <CoverArt id="hero-v25" track="regulacao" variant="hero"/>
    <div style={{position:'absolute',left:'9%',top:'11%',maxWidth:250}}><div className="eyebrow">Pausa · espaço · perspectiva</div></div>
    <div style={{position:'absolute',left:'11%',bottom:'12%',width:120,height:120,color:'#234a42',opacity:.72}}><TrackGlyph track="regulacao"/></div>
  </div>;
}
