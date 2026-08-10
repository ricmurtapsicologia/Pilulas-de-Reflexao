'use server';

import { redirect } from 'next/navigation';
import { getStripe } from '@/lib/stripe';

export async function startPremiumCheckout(){
  const price=process.env.STRIPE_PREMIUM_PRICE_ID;
  const app=process.env.NEXT_PUBLIC_APP_URL||'http://localhost:3000';
  if(!price) throw new Error('STRIPE_PREMIUM_PRICE_ID não configurado');
  const session=await getStripe().checkout.sessions.create({mode:'subscription',line_items:[{price,quantity:1}],success_url:`${app}/account?checkout=success`,cancel_url:`${app}/pricing?checkout=cancelled`,allow_promotion_codes:false,billing_address_collection:'auto'});
  if(!session.url) throw new Error('Checkout sem URL');
  redirect(session.url);
}
