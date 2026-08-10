import { ImageResponse } from 'next/og';
import { getPill, getTrack, pills } from '@/lib/catalog';

export const alt='Pílulas de Reflexão';
export const size={width:1200,height:630};
export const contentType='image/png';
export function generateStaticParams(){return pills.map(p=>({slug:p.slug}))}

const palette:Record<string,[string,string]>={pensamentos:['#dfe9e5','#355c54'],emocoes:['#ebe3e7','#685b64'],acao:['#e7e7dc','#5e6249'],regulacao:['#e0e8e9','#52656a'],autoconhecimento:['#ebe6dd','#6a5e4d'],cotidiano:['#e7e7e5','#5d5e61']};

export default async function Image({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=getPill(slug)||pills[0];const track=getTrack(p.track);const [soft,dark]=palette[p.track];return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',background:'#f5f2eb',color:'#202a27',padding:'58px 64px',position:'relative',overflow:'hidden'}}><div style={{display:'flex',flexDirection:'column',justifyContent:'space-between',width:'72%',zIndex:2}}><div style={{display:'flex',fontSize:22,letterSpacing:3,textTransform:'uppercase',color:dark}}>{track?.name}</div><div style={{display:'flex',fontSize:66,lineHeight:1.02,letterSpacing:-3,maxWidth:790}}>{p.title}</div><div style={{display:'flex',fontSize:22,color:'#66706c'}}>Pílulas de Reflexão · psicoeducação, reflexão e prática</div></div><div style={{display:'flex',position:'absolute',right:-40,top:-60,width:470,height:470,borderRadius:999,background:soft,opacity:.95}}/><div style={{display:'flex',position:'absolute',right:110,top:120,width:250,height:250,borderRadius:999,border:`3px solid ${dark}`,opacity:.32}}/><div style={{display:'flex',position:'absolute',right:52,bottom:28,fontSize:24,color:dark}}>PR · {p.id.replace('pr-','')}</div></div>,size)}
