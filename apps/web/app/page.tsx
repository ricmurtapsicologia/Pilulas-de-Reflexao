import Link from 'next/link';
import { ArrowRight, Headphones, BookOpen, Sparkles } from 'lucide-react';
import { HeroArt, CoverArt } from '@/components/cover-art';
import { PillCard } from '@/components/pill-card';
import { TrackCard } from '@/components/track-card';
import { pills, tracks } from '@/lib/catalog';

export default async function Home({searchParams}:{searchParams:Promise<{trilha?:string}>}){
  const {trilha}=await searchParams;
  const visible=trilha?pills.filter(p=>p.track===trilha):pills;
  const featured=pills[0];
  return <main id="conteudo">
    <section className="hero"><div className="shell hero-grid"><div>
      <p className="eyebrow">Psicoeducação · reflexão · prática</p>
      <h1 className="display">Uma pausa curta pode abrir espaço para uma resposta diferente.</h1>
      <p className="lede">Experiências breves para compreender melhor pensamentos, emoções e comportamentos — sem obrigação de resolver tudo agora.</p>
      <div className="hero-actions"><Link className="btn btn-primary" href="#biblioteca">Encontrar uma pílula <ArrowRight size={17}/></Link><Link className="btn" href="#como-funciona">Como funciona</Link></div>
    </div><HeroArt/></div></section>

    <section className="section" id="trilhas"><div className="shell"><div className="section-head"><div><p className="eyebrow">Percursos temáticos</p><h2 className="section-title">Escolha uma trilha</h2><p className="section-copy">A trilha organiza habilidades relacionadas. Você continua livre para começar pela experiência que fizer mais sentido.</p></div></div><div className="track-grid">{tracks.map(t=><TrackCard key={t.id} {...t}/>)}</div></div></section>

    <section className="section"><div className="shell"><div className="feature"><div><p className="eyebrow" style={{color:'#dfe9e5'}}>Uma possibilidade de começo</p><h2 className="section-title">{featured.title}</h2><p className="muted">{featured.description}</p><div className="hero-actions"><Link className="btn" href={`/pilulas/${featured.slug}`}>Abrir experiência <ArrowRight size={16}/></Link></div></div><div style={{minHeight:220,borderRadius:22,overflow:'hidden'}}><CoverArt id={featured.id} title={featured.shortTitle} track={featured.track}/></div></div></div></section>

    <section className="section" id="como-funciona"><div className="shell"><div className="section-head"><div><p className="eyebrow">A experiência</p><h2 className="section-title">Escute. Leia. Experimente.</h2><p className="section-copy">Áudio não é o produto inteiro. Cada pílula combina explicação, reflexão e uma pequena possibilidade de aplicação.</p></div></div><div className="track-grid"><article className="track-card"><Headphones size={30}/><div><h3>Escute</h3><p>Áudios curtos escritos para o ouvido, com voz clara, pausas naturais e sonoplastia restrita ao que agrega.</p></div></article><article className="track-card"><BookOpen size={30}/><div><h3>Leia</h3><p>Versão editorial breve e transcrição integral quando o áudio estiver publicado.</p></div></article><article className="track-card"><Sparkles size={30}/><div><h3>Experimente</h3><p>Uma pergunta ou prática pequena, sem transformar a reflexão em formulário ou coleta de dado clínico.</p></div></article></div></div></section>

    <section className="section" id="biblioteca"><div className="shell"><div className="section-head"><div><p className="eyebrow">Biblioteca</p><h2 className="section-title">{trilha?tracks.find(t=>t.id===trilha)?.name:'Todas as pílulas'}</h2><p className="section-copy">V2.5 separa conteúdo, mídia e direitos de acesso. Os oito áudios legados permanecem em revisão até o novo master ser aprovado.</p></div>{trilha?<Link className="btn" href="/#biblioteca">Limpar filtro</Link>:null}</div><div className="library">{visible.map(p=><PillCard key={p.id} pill={p}/>)}</div></div></section>
  </main>;
}
