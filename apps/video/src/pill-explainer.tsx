import React from 'react';
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export type PillExplainerProps={id:string;title:string;track:string;accent:string;soft:string;steps:string[];closing:string};
const font='Inter, Arial, sans-serif';

export const PillExplainer:React.FC<PillExplainerProps>=({id,title,track,accent,soft,steps,closing})=>{
  const frame=useCurrentFrame(); const {fps,width,height}=useVideoConfig(); const vertical=height>width;
  const intro=spring({frame,fps,config:{damping:18,stiffness:90}}); const fade=interpolate(frame,[0,18],[0,1],{extrapolateRight:'clamp'});
  return <AbsoluteFill style={{background:'#f5f2eb',color:'#202a27',fontFamily:font,padding:vertical?72:94}}>
    <div style={{position:'absolute',right:vertical?-160:-100,top:vertical?160:-110,width:vertical?720:760,height:vertical?720:760,borderRadius:999,background:soft,opacity:.88}}/>
    <div style={{position:'absolute',right:vertical?100:120,top:vertical?360:170,width:vertical?380:340,height:vertical?380:340,borderRadius:999,border:`3px solid ${accent}`,opacity:.22}}/>
    <Sequence from={0} durationInFrames={390}><div style={{opacity:fade,transform:`translateY(${(1-intro)*24}px)`,maxWidth:vertical?'88%':'72%'}}><div style={{fontSize:vertical?28:24,letterSpacing:4,textTransform:'uppercase',color:accent,fontWeight:700}}>{track}</div><div style={{fontSize:vertical?86:92,lineHeight:.98,letterSpacing:-5,fontWeight:560,marginTop:32}}>{title}</div><div style={{fontSize:vertical?26:24,color:'#66706c',marginTop:34}}>Pílulas de Reflexão · {id.toUpperCase()}</div></div></Sequence>
    <Sequence from={390} durationInFrames={1500}><AbsoluteFill style={{padding:vertical?'480px 72px 160px':'330px 130px 140px',justifyContent:'center'}}><div style={{display:'flex',flexDirection:vertical?'column':'row',gap:vertical?28:20,alignItems:'stretch'}}>{steps.map((step,i)=>{const local=Math.max(0,frame-(390+i*150));const s=spring({frame:local,fps,config:{damping:20,stiffness:100}});return <React.Fragment key={step}><div style={{flex:1,minHeight:vertical?150:170,border:`1px solid ${accent}44`,background:'#fffdf9',borderRadius:28,padding:28,display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',fontSize:vertical?34:30,fontWeight:650,opacity:s,transform:`translateY(${(1-s)*22}px)`}}>{step}</div>{i<steps.length-1&&!vertical?<div style={{display:'flex',alignItems:'center',fontSize:34,color:accent,opacity:.5}}>→</div>:null}</React.Fragment>})}</div></AbsoluteFill></Sequence>
    <Sequence from={1890}><AbsoluteFill style={{padding:vertical?'500px 72px 180px':'300px 150px',justifyContent:'center'}}><div style={{fontSize:vertical?58:54,lineHeight:1.08,letterSpacing:-2,maxWidth:vertical?'100%':'78%',fontWeight:540}}>{closing}</div><div style={{marginTop:38,fontSize:22,color:accent,letterSpacing:3,textTransform:'uppercase'}}>Pílulas de Reflexão</div></AbsoluteFill></Sequence>
  </AbsoluteFill>;
};
