import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata={title:'Minha conta'};
export default async function Account(){
  const ready=Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY&&process.env.CLERK_SECRET_KEY&&process.env.DATABASE_URL);
  if(!ready)return <main id="conteudo"><section className="section"><div className="shell"><span className="badge">Staging</span><h1 className="section-title">Conta sincronizada ainda não provisionada.</h1><p className="lede">O modo sem conta permanece funcional. Esta área será ativada quando Clerk e banco estiverem configurados no ambiente de staging.</p></div></section></main>;
  const {userId}=await auth();if(!userId)redirect('/sign-in?redirect_url=/account');const user=await currentUser();
  return <main id="conteudo"><section className="section"><div className="shell"><p className="eyebrow">Conta sincronizada</p><h1 className="section-title">{user?.firstName?`Olá, ${user.firstName}.`:'Sua conta'}</h1><p className="lede">A conta guarda acesso, favoritos e progresso sincronizável. Textos de reflexão não pertencem a este banco de dados.</p><div className="track-grid" style={{marginTop:30}}><article className="track-card"><h3>Progresso</h3><p>Posição e conclusão podem ser sincronizadas entre dispositivos quando a conta está ativa.</p></article><article className="track-card"><h3>Acesso</h3><p>Entitlements: livre, premium, paciente ou institucional.</p></article><article className="track-card"><h3>Privacidade</h3><p>O modo sem conta continua disponível para conteúdo livre.</p></article></div></div></section></main>}
