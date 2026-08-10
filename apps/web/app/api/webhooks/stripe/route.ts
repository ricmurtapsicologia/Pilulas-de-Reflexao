import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { getDb } from '@/lib/db';
import { getStripe } from '@/lib/stripe';
import { entitlements, purchases, users } from '@/db/schema';

export const runtime='nodejs';

export async function POST(req:Request){
  const started=Date.now(); const signature=req.headers.get('stripe-signature'); const secret=process.env.STRIPE_WEBHOOK_SECRET;
  if(!signature||!secret) return Response.json({error:'Webhook não configurado'},{status:503});
  let event:Stripe.Event;
  try{event=getStripe().webhooks.constructEvent(await req.text(),signature,secret)}catch(err){console.error(JSON.stringify({level:'error',msg:'stripe_signature_invalid',ms:Date.now()-started}));return Response.json({error:'Invalid signature'},{status:400})}
  const db=getDb();
  try{
    if(event.type==='checkout.session.completed'){
      const session=event.data.object as Stripe.Checkout.Session; const authUserId=session.metadata?.authUserId||session.client_reference_id; if(authUserId){
        await db.insert(users).values({authUserId}).onConflictDoNothing({target:users.authUserId});
        const [user]=await db.select().from(users).where(eq(users.authUserId,authUserId)).limit(1);
        if(user){
          await db.insert(purchases).values({userId:user.id,provider:'stripe',externalId:session.id,status:'completed'}).onConflictDoNothing({target:[purchases.provider,purchases.externalId]});
          const externalRef=typeof session.subscription==='string'?session.subscription:session.id;
          await db.insert(entitlements).values({userId:user.id,level:'premium',status:'active',source:'stripe',externalRef}).onConflictDoNothing();
        }
      }
    }
    if(event.type==='customer.subscription.deleted'){
      const subscription=event.data.object as Stripe.Subscription;
      await db.update(entitlements).set({status:'inactive'}).where(eq(entitlements.externalRef,subscription.id));
    }
    console.log(JSON.stringify({level:'info',msg:'stripe_webhook_processed',event:event.type,id:event.id,ms:Date.now()-started}));
    return Response.json({received:true});
  }catch(err){console.error(JSON.stringify({level:'error',msg:'stripe_webhook_failed',event:event.type,id:event.id,error:err instanceof Error?err.message:'unknown',ms:Date.now()-started}));return Response.json({error:'Processing failed'},{status:500})}
}
