import { useId } from 'react';

export default function Logo({ size = 28, withText = true, className = '' }) {
  const gradientId = `logoGradient-${useId()}`;

  return (
    <span className={`logo ${className}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" className="logo-mark" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d64550" />
            <stop offset="100%" stopColor="#f5a623" />
          </linearGradient>
        </defs>
        <circle
          cx="32"
          cy="32"
          r="22"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="96 142"
          transform="rotate(-45 32 32)"
        />
        <circle cx="48.5" cy="15.5" r="5.5" fill={`url(#${gradientId})`} />
      </svg>
      {withText && <span className="logo-text">Campus Connect</span>}
    </span>
  );
}