import { get } from '@vercel/blob';
import { and, desc, eq } from 'drizzle-orm';
import { mediaAssets } from '@/db/schema';
import { canAccess } from '@/lib/access';
import { getPill } from '@/lib/catalog';
import { getDb } from '@/lib/db';

export const runtime='nodejs';

export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
  const started=Date.now(); const {id}=await params; const pill=getPill(id)??null;
  const content=pill||undefined;
  if(!content)return new Response('Not found',{status:404});
  const access=await canAccess(content.access);
  if(!access.allowed)return new Response('Unauthorized',{status:401,headers:{'Cache-Control':'no-store'}});
  const db=getDb(); const [asset]=await db.select().from(mediaAssets).where(and(eq(mediaAssets.contentId,content.id),eq(mediaAssets.kind,'audio'),eq(mediaAssets.qcStatus,'approved'))).orderBy(desc(mediaAssets.createdAt)).limit(1);
  if(!asset)return new Response('Audio not published',{status:404});
  const result=await get(asset.blobUrl,{access:'private',headers:req.headers.get('range')?{Range:req.headers.get('range')!}:undefined});
  if(!result||result.statusCode<200||result.statusCode>299)return new Response('Media unavailable',{status:404});
  console.log(JSON.stringify({level:'info',msg:'media_stream',contentId:content.id,ms:Date.now()-started}));
  return new Response(result.stream,{status:result.statusCode,headers:{'Content-Type':result.blob.contentType||'audio/mpeg','Cache-Control':'private, max-age=300','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'}});
}
