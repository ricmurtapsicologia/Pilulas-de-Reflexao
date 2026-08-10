# Pílulas de Reflexão

Produto digital de microexperiências psicoeducativas em português do Brasil.

> Branch `v2.5-commercial-audio`: base comercial/multimodal em validação. O `main` continua preservando a versão pública estática até que os gates de staging, mídia, acessibilidade e compliance sejam concluídos.

## Propósito

Pílulas de Reflexão combina áudio, leitura, microvisuais e pequenas experiências reflexivas. O produto não realiza diagnóstico e não se apresenta como psicoterapia automatizada. Conteúdo clínico individualizado e prontuário permanecem fora desta aplicação.

## Workspace V2.5

```text
apps/
  web/       Next.js 16, UI, auth, paywall, storage, pagamentos e Trust Center
  video/     Remotion para microvídeos 16:9 e 9:16
content/
  audio/     manifesto e 20 roteiros V2.5
media/       workspace local de source/master/render (binários ignorados pelo Git)
scripts/     TTS, masterização, QC e orquestração de mídia
tests/       gates estruturais/editoriais
```

A versão estática anterior (`index.html`, `assets/`, `data/`) continua no branch por compatibilidade e também é validada pelo workflow herdado.

## Stack de referência

- Next.js / React / TypeScript;
- Tailwind CSS + componentes proprietários sobre shadcn/Radix;
- Geist para interface;
- Lucide para iconografia funcional;
- SVG proprietário para glyphs de trilha e marca;
- `next/og` para OG/WhatsApp cards automáticos;
- Clerk-ready authentication;
- Neon + Drizzle para dados operacionais;
- Stripe Checkout/Webhooks para assinatura e entitlements;
- Vercel Blob privado para mídia premium;
- Remotion para microvídeo;
- FFmpeg/FFprobe para masterização e QC;
- OpenAI Audio Speech parametrizado para renderização TTS quando houver chave configurada.

## Design system

A linguagem visual não usa comprimidos, cérebros, lótus, corações ou fotografias clichês de sofrimento. A marca trabalha com pausa, espaço, perspectiva, movimento e integração.

- `apps/web/components/glyphs.tsx` — símbolo e seis glyphs conceituais;
- `apps/web/components/cover-art.tsx` — capas determinísticas a partir de `id + trilha`;
- `apps/web/components/campaign-banner.tsx` — banners parametrizados;
- `apps/web/components/clinical-visual.tsx` — diagramas clínicos reutilizáveis;
- `/design-system` — Design Lab em código;
- `/pilulas/[slug]/opengraph-image.tsx` — OG 1200×630 gerado automaticamente.

## Catálogo e acesso

`apps/web/lib/catalog.ts` contém 20 pílulas V2.5 com nível de acesso:

- `free`;
- `premium`;
- `patient`;
- `institutional`.

Conteúdo premium não é apenas escondido no cliente. A página consulta autorização no servidor; mídia aprovada é servida por rota protegida e storage privado.

## Dados

O banco V2.5 possui apenas dados operacionais do produto:

- usuários;
- conteúdos e versões;
- mídia;
- entitlements;
- progresso;
- favoritos;
- compras;
- auditoria.

Não existe tabela de prontuário ou notas terapêuticas.

Sem conta, o conteúdo livre continua funcionando e progresso/favoritos podem permanecer em `localStorage`. Com conta e infraestrutura provisionada, esses estados são sincronizados.

## Fábrica de áudio

O catálogo possui 20 roteiros V2.5 em `content/audio/scripts/`. Os oito MP3 históricos estão explicitamente marcados para reescrita/substituição; nenhum deles é considerado master V2.5.

Fluxo:

```text
roteiro aprovado
→ gravação/TTS WAV
→ edição
→ master em dois passes
→ QC automático
→ escuta humana
→ transcrição reconciliada
→ Blob privado
→ media_assets.qc_status = approved
→ audioState = master-approved
```

Alvo interno atual: `-16 LUFS`, true peak `≤ -1 dBTP`, LRA de referência `7`.

### Renderizar uma pílula

```bash
OPENAI_API_KEY=... pnpm audio:build pr-001
```

### Renderizar as 20

Há uma trava explícita para evitar custo TTS acidental:

```bash
OPENAI_API_KEY=... pnpm audio:build --all --confirm-cost
```

### QC

```bash
pnpm audio:qc
```

O QC falha para arquivo ausente, duração anômala, loudness fora do alvo, peak excessivo ou silêncio interno excessivo. Aprovação automática não substitui escuta humana.

## Vídeo

`apps/video` contém um template Remotion reutilizável em 16:9 e 9:16. A mesma linguagem de cores, tipografia e fluxo conceitual da web é reutilizada nos vídeos.

```bash
pnpm install
pnpm video:studio
```

Os vídeos só devem ser renderizados quando narração, duração e conteúdo estiverem aprovados.

## Desenvolvimento

```bash
pnpm install
pnpm validate
pnpm typecheck
pnpm dev
```

Variáveis necessárias estão documentadas em `apps/web/.env.example`.

## Banco

Migração inicial:

- `apps/web/drizzle/0000_v25_initial.sql`

Seed dos 20 conteúdos:

- `apps/web/db/seed-content.sql`

## Staging e produção

Ambientes previstos:

- development;
- staging;
- production.

O branch foi preparado para Vercel, mas um projeto Vercel e as integrações externas precisam ser provisionados antes que login, banco, checkout e Blob funcionem de ponta a ponta.

## Gates de lançamento comercial

Não ativar cobrança real nem fazer merge da V2.5 para produção enquanto não houver:

1. projeto de staging provisionado;
2. Clerk, banco, Stripe sandbox e Blob configurados;
3. 20/20 áudios renderizados/gravados, masterizados e aprovados humanamente;
4. 20/20 transcrições reconciliadas com os masters;
5. substituição dos oito MP3 legados;
6. testes de acesso `free/premium/patient/institutional`;
7. cancelamento e webhook testados;
8. QA mobile/desktop/teclado/leitor de tela;
9. identificação profissional validada e inserida;
10. revisão jurídica final de privacidade, termos, compra/reembolso e faixa etária;
11. beta controlado antes de distribuição comercial ampla.

## CI

Dois workflows convivem no branch:

- `Quality` — valida a versão estática herdada;
- `V2.5 Commercial & Audio Gate` — valida 20 conteúdos/roteiros, estrutura multimodal, typecheck e build Next.js.

## Princípio de governança

Nova mídia só recebe status de publicada quando existe de fato e passou pelos gates técnicos e humanos. A aplicação não cria links fictícios nem expõe conteúdo premium apenas por ocultação no frontend.
