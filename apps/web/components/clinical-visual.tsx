import type { Pill } from '@/lib/catalog';

const models:Partial<Record<string,{title:string;steps:string[]}>>={
  'pr-001':{title:'Do acontecimento à resposta',steps:['Acontecimento','Interpretação','Emoção','Ação']},
  'pr-004':{title:'Quando reflexão vira repetição',steps:['Pergunta','Análise','Mesma pergunta','Existe ação possível?']},
  'pr-006':{title:'O ciclo do alerta',steps:['Ameaça percebida','Ativação corporal','Atenção ao perigo','Interpretação ameaçadora']},
  'pr-011':{title:'Como a evitação se fortalece',steps:['Desconforto','Evito','Alívio imediato','Evitação mais provável']},
  'pr-013':{title:'Retornar é parte da prática',steps:['Atenção presente','Distração','Percebo','Retorno']},
  'pr-015':{title:'Da urgência à escolha',steps:['Percebo','Nomeio','Pauso','Escolho']},
  'pr-019':{title:'Direção e marco',steps:['Valor: direção','Escolhas repetidas','Meta: marco','Nova escolha']},
  'pr-020':{title:'Da crítica à aprendizagem',steps:['Algo deu errado','Rótulo global','Responsabilidade','Próximo passo']},
};

export function ClinicalVisual({pill}:{pill:Pill}){
  const model=models[pill.id]; if(!model)return null; const cycle=pill.visual==='cycle';
  return <section aria-labelledby={`visual-${pill.id}`} style={{margin:'30px 0',padding:20,border:'1px solid var(--border)',borderRadius:20,background:'var(--surface)'}}>
    <p className="eyebrow">Microvisual</p><h2 id={`visual-${pill.id}`} style={{fontSize:'1.2rem',margin:'6px 0 18px'}}>{model.title}</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10}}>{model.steps.map((step,i)=><div key={step} style={{border:'1px solid var(--border)',borderRadius:14,padding:'16px 12px',minHeight:82,display:'grid',placeItems:'center',textAlign:'center',fontWeight:650,background:i===model.steps.length-1?'var(--brand-soft)':'var(--surface)'}}><span>{step}</span>{cycle&&i===model.steps.length-1?<small style={{display:'block',color:'var(--muted)',fontWeight:450,marginTop:5}}>o ciclo pode recomeçar</small>:null}</div>)}</div>
    <p className="muted" style={{fontSize:'.82rem',margin:'14px 0 0'}}>O diagrama é uma simplificação didática; o texto da pílula explica o contexto e os limites do modelo.</p>
  </section>;
}
