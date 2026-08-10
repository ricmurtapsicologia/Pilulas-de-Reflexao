'use client';

import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';

export function FavoriteButton({id}:{id:string}){
  const key=`pilulas:favorite:${id}`; const [favorite,setFavorite]=useState(false);
  useEffect(()=>{let active=true;const local=localStorage.getItem(key)==='1';setFavorite(local);void (async()=>{try{const res=await fetch(`/api/favorites?contentId=${encodeURIComponent(id)}`,{cache:'no-store'});if(res.ok){const data=await res.json();if(active&&data.synced){setFavorite(Boolean(data.favorite));localStorage.setItem(key,data.favorite?'1':'0')}}}catch{/* modo local */}})();return()=>{active=false}},[id,key]);
  const toggle=()=>{const next=!favorite;setFavorite(next);localStorage.setItem(key,next?'1':'0');void fetch('/api/favorites',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contentId:id,favorite:next}),keepalive:true}).catch(()=>{})};
  return <button className="btn" type="button" aria-pressed={favorite} onClick={toggle}><Bookmark size={16} fill={favorite?'currentColor':'none'}/>{favorite?'Salva':'Salvar'}</button>;
}
