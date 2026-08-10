import { auth } from '@clerk/nextjs/server';
import { and, eq, inArray } from 'drizzle-orm';
import { entitlements, users } from '@/db/schema';
import { getDb } from '@/lib/db';
import type { Access } from '@/lib/catalog';

export async function canAccess(required:Access){
  if(required==='free') return {allowed:true,userId:null};
  const {userId:authUserId}=await auth();
  if(!authUserId) return {allowed:false,userId:null};
  const db=getDb();
  const [user]=await db.select().from(users).where(eq(users.authUserId,authUserId)).limit(1);
  if(!user) return {allowed:false,userId:null};
  const levels:Access[]=required==='premium'?['premium','patient','institutional']:[required,'premium','institutional'];
  const rows=await db.select().from(entitlements).where(and(eq(entitlements.userId,user.id),eq(entitlements.status,'active'),inArray(entitlements.level,levels))).limit(1);
  return {allowed:rows.length>0,userId:user.id};
}
