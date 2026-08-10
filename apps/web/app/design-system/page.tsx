import { CoverArt } from '@/components/cover-art';
import { BrandGlyph, TrackGlyph } from '@/components/glyphs';
import { pills, tracks } from '@/lib/catalog';

export const metadata={title:'Design Lab'};
export default function DesignSystem(){return <main id="conteudo"><section className="section"><div className="shell"><p className="eyebrow">Ambiente interno · V2.5</p><h1 className="section-title">Design Lab</h1><p className="section-copy">Referência visual em código para marca, tipografia, cores, glyphs, cards e capas. Não é uma página comercial.</p>
<section className="section"><h2>Marca</h2><div className="glyph-sample" style={{maxWidth:180}}><BrandGlyph width={84} height={84}/></div></section>
<section className="section"><h2>Cores semânticas</h2><div className="design-grid"><div className="swatch" style={{background:'var(--background)'}}>background</div><div className="swatch" style={{background:'var(--surface)'}}>surface</div><div className="swatch" style={{background:'var(--brand)',color:'#fff'}}>brand</div><div className="swatch" style={{background:'var(--brand-soft)'}}>brand-soft</div></div></section>
<section className="section"><h2>Glyphs de trilha</h2><div className="glyph-grid">{tracks.map(t=><div className="glyph-sample" key={t.id}><div style={{width:54,height:54}}><TrackGlyph track={t.id}/></div></div>)}</div></section>
<section className="section"><h2>Capas determinísticas</h2><div className="design-grid">{pills.slice(0,8).map(p=><div key={p.id} style={{aspectRatio:'1/1',borderRadius:20,overflow:'hidden'}}><CoverArt id={p.id} title={p.shortTitle} track={p.track}/></div>)}</div></section>
<section className="section"><h2>Tipografia</h2><p className="display" style={{fontSize:'4rem'}}>Pausa, espaço e perspectiva.</p><p className="lede">A hierarquia é conduzida primeiro por tipografia e espaço. Cor e decoração são secundários.</p></section>
</div></section></main>}
