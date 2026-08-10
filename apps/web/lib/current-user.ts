import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { users } from '@/db/schema';
import { getDb } from '@/lib/db';

export async function getOrCreateCurrentUser(){
  if(!process.env.DATABASE_URL||!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY||!process.env.CLERK_SECRET_KEY)return null;
  const {userId:authUserId}=await auth();
  if(!authUserId)return null;
  const db=getDb();
  await db.insert(users).values({authUserId}).onConflictDoNothing({target:users.authUserId});
  const [user]=await db.select().from(users).where(eq(users.authUserId,authUserId)).limit(1);
  return user??null;
}
