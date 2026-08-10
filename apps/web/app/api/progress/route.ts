import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { progress } from '@/db/schema';
import { getOrCreateCurrentUser } from '@/lib/current-user';
import { getDb } from '@/lib/db';

const payload=z.object({contentId:z.string().regex(/^pr-\d{3}$/),positionSeconds:z.number().int().nonnegative().max(86400),completed:z.boolean().default(false)});

export async function GET(req:Request){
  const user=await getOrCreateCurrentUser(); if(!user)return Response.json({synced:false},{status:200});
  const contentId=new URL(req.url).searchParams.get('contentId'); if(!contentId)return Response.json({error:'contentId required'},{status:400});
  const db=getDb(); const [row]=await db.select().from(progress).where(and(eq(progress.userId,user.id),eq(progress.contentId,contentId))).limit(1);
  return Response.json({synced:true,positionSeconds:row?.positionSeconds||0,completed:row?.completed||false});
}

export async function POST(req:Request){
  const user=await getOrCreateCurrentUser(); if(!user)return new Response(null,{status:204});
  const parsed=payload.safeParse(await req.json()); if(!parsed.success)return Response.json({error:'invalid payload'},{status:400});
  const db=getDb(); const data=parsed.data;
  await db.insert(progress).values({userId:user.id,contentId:data.contentId,positionSeconds:data.positionSeconds,completed:data.completed,updatedAt:new Date()}).onConflictDoUpdate({target:[progress.userId,progress.contentId],set:{positionSeconds:data.positionSeconds,completed:data.completed,updatedAt:new Date()}});
  return Response.json({synced:true});
}
