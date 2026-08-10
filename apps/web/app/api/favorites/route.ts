import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { favorites } from '@/db/schema';
import { getOrCreateCurrentUser } from '@/lib/current-user';
import { getDb } from '@/lib/db';

const payload=z.object({contentId:z.string().regex(/^pr-\d{3}$/),favorite:z.boolean()});

export async function GET(req:Request){
  const user=await getOrCreateCurrentUser(); if(!user)return Response.json({synced:false,favorite:false});
  const contentId=new URL(req.url).searchParams.get('contentId'); if(!contentId)return Response.json({error:'contentId required'},{status:400});
  const db=getDb(); const [row]=await db.select().from(favorites).where(and(eq(favorites.userId,user.id),eq(favorites.contentId,contentId))).limit(1);
  return Response.json({synced:true,favorite:Boolean(row)});
}

export async function POST(req:Request){
  const user=await getOrCreateCurrentUser(); if(!user)return new Response(null,{status:204});
  const parsed=payload.safeParse(await req.json()); if(!parsed.success)return Response.json({error:'invalid payload'},{status:400});
  const db=getDb(); const {contentId,favorite}=parsed.data;
  if(favorite)await db.insert(favorites).values({userId:user.id,contentId}).onConflictDoNothing({target:[favorites.userId,favorites.contentId]});
  else await db.delete(favorites).where(and(eq(favorites.userId,user.id),eq(favorites.contentId,contentId)));
  return Response.json({synced:true,favorite});
}
