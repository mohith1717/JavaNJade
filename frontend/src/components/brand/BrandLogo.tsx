import { useId } from "react";

export function BrandLogo({ className = "", label = "JadeGuard" }: { className?: string; label?: string }) {
  const id = useId().replaceAll(":", "");
  return <span className={`brand-logo ${className}`.trim()}>
    <svg viewBox="0 0 48 48" role="img" aria-label={`${label} logo`}>
      <defs>
        <linearGradient id={`${id}-shield`} x1="7" y1="5" x2="41" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#41E0C1" />
          <stop offset=".52" stopColor="#5D82F2" />
          <stop offset="1" stopColor="#A967F5" />
        </linearGradient>
        <linearGradient id={`${id}-jade`} x1="18" y1="17" x2="31" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8EFFE6" />
          <stop offset="1" stopColor="#22B99F" />
        </linearGradient>
      </defs>
      <path className="brand-logo-shield" d="M24 3.8 40.2 9v12.4c0 10.4-6.1 18.1-16.2 23-10.1-4.9-16.2-12.6-16.2-23V9L24 3.8Z" fill="rgba(9,14,24,.88)" stroke={`url(#${id}-shield)`} strokeWidth="2.2" strokeLinejoin="round" />
      <path className="brand-logo-route" d="M13.7 17.2c4.2-5 9.4-3.4 10.2 1.1.9 5.1 6.6 6.8 10.5 2.2" fill="none" stroke={`url(#${id}-shield)`} strokeWidth="2" strokeLinecap="round" />
      <circle className="brand-logo-node brand-logo-node-one" cx="13.5" cy="17.3" r="2.5" fill="#41E0C1" />
      <circle className="brand-logo-node brand-logo-node-two" cx="34.7" cy="20.2" r="2.5" fill="#9B70F8" />
      <path className="brand-logo-core" d="m24 18 6.5 7L24 32l-6.5-7L24 18Z" fill={`url(#${id}-jade)`} stroke="#D8FFF7" strokeWidth="1" />
      <path className="brand-logo-trail" d="M16.2 34.1c2.1 1.9 4.7 3.6 7.8 5.2 3.1-1.6 5.7-3.3 7.8-5.2" fill="none" stroke="#7188F5" strokeWidth="1.7" strokeLinecap="round" opacity=".85" />
    </svg>
  </span>;
}
