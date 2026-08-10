import type { SVGProps } from 'react';

export type TrackId = 'pensamentos'|'emocoes'|'acao'|'regulacao'|'autoconhecimento'|'cotidiano';

type Props = SVGProps<SVGSVGElement> & { track: TrackId };

export function BrandGlyph(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
    <path d="M11 13.5C15.5 9.7 20.7 8 26.4 8c5.2 0 9.2 1.2 11.6 2.7-4.6 1.1-8.6 3.4-11.6 6.8-3.2 3.7-5.1 8.4-5.3 13.4-4.1-3.5-7.4-9.2-10.1-17.4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M37.6 13.8c-1.4 6.7-4 12.1-8 16.1-4 4.1-8.9 6.4-14.8 7 3.4 2 7.2 3.1 11.2 3.1 6.7 0 12.1-2.5 15.3-6.8 2.4-3.2 3.2-7.4 2.3-12.4-.7-3.8-2.5-6.3-6-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}

export function TrackGlyph({track,...props}:Props) {
  const common = {viewBox:'0 0 48 48',fill:'none',stroke:'currentColor',strokeWidth:1.8,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true,...props};
  if(track==='pensamentos') return <svg {...common}><path d="M8 16c7-6 17-7 31-3M9 24c9-5 19-5 30 0M10 32c8-3 17-2 28 4"/><circle cx="14" cy="16" r="2" fill="currentColor" stroke="none"/></svg>;
  if(track==='emocoes') return <svg {...common}><path d="M6 26c5-13 11-13 16 0s11 13 20 0"/><path d="M7 34c6-7 12-7 18 0s11 7 16 1" opacity=".55"/></svg>;
  if(track==='acao') return <svg {...common}><path d="M7 35c6-15 13-21 22-18 5 2 7 7 12 3"/><circle cx="7" cy="35" r="2.5" fill="currentColor" stroke="none"/><circle cx="41" cy="20" r="2.5" fill="currentColor" stroke="none"/></svg>;
  if(track==='regulacao') return <svg {...common}><path d="M33 11a16 16 0 1 0 4 24"/><path d="M29 17a9 9 0 1 0 3 14"/><circle cx="24" cy="24" r="2" fill="currentColor" stroke="none"/></svg>;
  if(track==='autoconhecimento') return <svg {...common}><path d="M36 13c-4-4-10-6-16-4-8 2-13 10-11 18 2 9 11 14 20 11"/><path d="M32 17c-3-2-7-3-10-1-5 2-7 7-5 12 2 4 6 6 10 5"/><circle cx="25" cy="24" r="2.2" fill="currentColor" stroke="none"/></svg>;
  return <svg {...common}><rect x="7" y="9" width="9" height="9" rx="2"/><rect x="20" y="9" width="9" height="9" rx="2"/><rect x="33" y="9" width="8" height="9" rx="2"/><rect x="7" y="23" width="9" height="9" rx="2"/><rect x="20" y="23" width="9" height="9" rx="2"/><path d="M33 27h8M7 38h22"/></svg>;
}
