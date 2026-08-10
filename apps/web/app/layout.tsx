import type { Metadata } from 'next';
import Link from 'next/link';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GeistSans } from 'geist/font/sans';
import { BrandGlyph } from '@/components/glyphs';
import './globals.css';

export const metadata:Metadata={
  metadataBase:new URL(process.env.NEXT_PUBLIC_APP_URL||'https://pilulas.example.com'),
  title:{default:'Pílulas de Reflexão',template:'%s | Pílulas de Reflexão'},
  description:'Microexperiências psicoeducativas em áudio, texto e recursos visuais para compreender pensamentos, emoções e pequenas possibilidades de ação.',
  openGraph:{type:'website',locale:'pt_BR',title:'Pílulas de Reflexão',description:'Uma pausa curta pode abrir espaço para uma resposta diferente.'},
};

function Shell({children}:{children:React.ReactNode}){
  const professional=process.env.NEXT_PUBLIC_PROFESSIONAL_NAME||'Richelmy Murta Pinto';
  const crp=process.env.NEXT_PUBLIC_CRP_DISPLAY;
  return <html lang="pt-BR" className={GeistSans.variable}>
    <body>
      <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>
      <header className="header"><div className="shell nav">
        <Link className="brand" href="/"><span className="brand-symbol"><BrandGlyph width={25} height={25}/></span><span>Pílulas de Reflexão</span></Link>
        <nav className="navlinks" aria-label="Navegação principal"><Link className="navlink" href="/#trilhas">Trilhas</Link><Link className="navlink" href="/#biblioteca">Biblioteca</Link><Link className="navlink" href="/confianca">Confiança</Link><Link className="navlink" href="/pricing">Acesso</Link></nav>
      </div></header>
      {children}
      <footer className="footer"><div className="shell footer-grid"><div><strong>Pílulas de Reflexão</strong><br/><span>Psicoeducação · reflexão · prática</span></div><div><strong>{professional}</strong>{crp?<><br/><span>{crp}</span></>:null}<br/><span>Conteúdo psicoeducativo; não substitui avaliação individual.</span></div></div></footer>
      <Analytics/><SpeedInsights/>
    </body>
  </html>;
}

export default function RootLayout({children}:{children:React.ReactNode}){
  const key=process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const shell=<Shell>{children}</Shell>;
  return key?<ClerkProvider publishableKey={key}>{shell}</ClerkProvider>:shell;
}
