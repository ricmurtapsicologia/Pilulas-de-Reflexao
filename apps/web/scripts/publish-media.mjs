#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';

const [contentId,file,version='2.5.0']=process.argv.slice(2);
if(!contentId||!file){console.error('Uso: node scripts/publish-media.mjs <pr-001> <media/masters/pr-001-v2.5.mp3> [version]');process.exit(2)}
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL não configurada');
if(!process.env.BLOB_READ_WRITE_TOKEN)throw new Error('BLOB_READ_WRITE_TOKEN não configurado');
const sql=neon(process.env.DATABASE_URL);const rows=await sql`select id from content_items where id=${contentId} limit 1`;if(!rows.length)throw new Error(`Conteúdo ${contentId} não foi semeado no banco`);
const bytes=await readFile(file);const pathname=`audio/${version}/${path.basename(file)}`;const blob=await put(pathname,bytes,{access:'private',addRandomSuffix:false,contentType:'audio/mpeg'});
await sql`insert into media_assets (id,content_id,kind,version,blob_url,private,qc_status,created_at) values (${randomUUID()},${contentId},'audio',${version},${blob.url},true,'approved',now()) on conflict (content_id,kind,version) do update set blob_url=excluded.blob_url,qc_status='approved',created_at=now()`;
console.log(JSON.stringify({contentId,version,pathname,status:'published-private'},null,2));
