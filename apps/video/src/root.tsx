import React from 'react';
import { Composition } from 'remotion';
import { PillExplainer, type PillExplainerProps } from './pill-explainer';

const defaults:PillExplainerProps={
  id:'pr-011',
  title:'O ciclo da evitação',
  track:'Ação e comportamento',
  accent:'#5e6249',
  soft:'#e7e7dc',
  steps:['Desconforto','Evito','Alívio imediato','Evitação fica mais provável'],
  closing:'O alívio explica por que evitamos. Perceber o ciclo abre espaço para outra escolha.',
};

export const Root:React.FC=()=> <>
  <Composition id="PillExplainer16x9" component={PillExplainer} durationInFrames={2700} fps={30} width={1920} height={1080} defaultProps={defaults}/>
  <Composition id="PillExplainer9x16" component={PillExplainer} durationInFrames={2700} fps={30} width={1080} height={1920} defaultProps={defaults}/>
</>;
