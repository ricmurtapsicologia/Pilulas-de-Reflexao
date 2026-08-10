import { and, eq, inArray } from 'drizzle-orm';
import { entitlements } from '@/db/schema';
import { getDb } from '@/lib/db';
import { getOrCreateCurrentUser } from '@/lib/current-user';
import type { Access } from '@/lib/catalog';

export async function canAccess(required:Access){
  if(required==='free') return {allowed:true,userId:null};
  if(!process.env.DATABASE_URL||!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY||!process.env.CLERK_SECRET_KEY)return {allowed:false,userId:null};
  const user=await getOrCreateCurrentUser();
  if(!user)return {allowed:false,userId:null};
  const db=getDb();
  const levels:Access[]=required==='premium'?['premium','patient','institutional']:[required,'premium','institutional'];
  const rows=await db.select().from(entitlements).where(and(eq(entitlements.userId,user.id),eq(entitlements.status,'active'),inArray(entitlements.level,levels))).limit(1);
  return {allowed:rows.length>0,userId:user.id};
}
