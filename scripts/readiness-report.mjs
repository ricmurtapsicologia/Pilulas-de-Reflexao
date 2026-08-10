#!/usr/bin/env node
import { access, readFile } from 'node:fs/promises';

async function exists(path){try{await access(path);return true}catch{return false}}
const manifest=JSON.parse(await readFile('content/audio/audio-manifest.json','utf8'));
const masters=await Promise.all(manifest.items.map(async x=>({id:x.id,ready:await exists(`media/masters/${x.output}`)})));
const checks=[
  ['20 conteúdos versionados',manifest.items.length===20,'code'],
  ['20 roteiros versionados',(await readFile('content/audio/scripts/pr-001-pr-005.md','utf8')).includes('## PR-001')&&(await readFile('content/audio/scripts/pr-016-pr-020.md','utf8')).includes('## PR-020'),'code'],
  ['App comercial Next.js',await exists('apps/web/app/page.tsx'),'code'],
  ['Design Lab',await exists('apps/web/app/design-system/page.tsx'),'code'],
  ['Paywall server-side',await exists('apps/web/lib/access.ts'),'code'],
  ['Checkout e webhook',await exists('apps/web/app/api/webhooks/stripe/route.ts'),'code'],
  ['Mídia privada',await exists('apps/web/app/api/media/[id]/route.ts'),'code'],
  ['Fábrica Remotion',await exists('apps/video/src/pill-explainer.tsx'),'code'],
  ['20 masters presentes',masters.every(x=>x.ready),'human/external'],
  ['Vercel configurado',Boolean(process.env.VERCEL),'external'],
  ['Auth configurada',Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY&&process.env.CLERK_SECRET_KEY),'external'],
  ['Banco configurado',Boolean(process.env.DATABASE_URL),'external'],
  ['Stripe configurado',Boolean(process.env.STRIPE_SECRET_KEY&&process.env.STRIPE_WEBHOOK_SECRET&&process.env.STRIPE_PREMIUM_PRICE_ID),'external'],
  ['Blob configurado',Boolean(process.env.BLOB_READ_WRITE_TOKEN),'external'],
  ['TTS configurado',Boolean(process.env.OPENAI_API_KEY),'external'],
  ['CRP validado e configurado',Boolean(process.env.NEXT_PUBLIC_CRP_DISPLAY),'human/external'],
];
console.log('\nPílulas de Reflexão V2.5 — readiness\n');
for(const [label,ok,kind] of checks)console.log(`${ok?'✓':'○'} [${kind}] ${label}`);
const blocking=checks.filter(([,,kind])=>kind!=='code' ).filter(([,ok])=>!ok).length;
console.log(`\nPendências externas/humanas: ${blocking}. Build verde não substitui esses gates.`);
