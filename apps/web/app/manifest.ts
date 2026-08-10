import type { MetadataRoute } from 'next';
export default function manifest():MetadataRoute.Manifest{return{name:'Pílulas de Reflexão',short_name:'Pílulas',description:'Microexperiências psicoeducativas em áudio, texto e recursos visuais.',start_url:'/',display:'standalone',background_color:'#f5f2eb',theme_color:'#234a42',lang:'pt-BR',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml'}]}}
