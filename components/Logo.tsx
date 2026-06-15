/** Xasu mark — plate swirl with a spoon (outline) and fork (solid),
 *  recreated as inline SVG so it scales crisply and inherits currentColor. */
export default function Logo({ className = "", size = 22 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none"
      className={className} aria-hidden="true" focusable="false">
      {/* plate + swirl tail */}
      <path d="M45 12.5 A23 23 0 1 0 51.5 44.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 49 A19 19 0 0 1 19.5 19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.45" />
      {/* spoon (outline) */}
      <ellipse cx="26" cy="24.5" rx="5" ry="8.2" stroke="currentColor" strokeWidth="2" />
      <path d="M26 32.5 L26 50.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* fork (solid) */}
      <g fill="currentColor">
        <rect x="36.4" y="13.5" width="1.8" height="11.5" rx="0.9" />
        <rect x="39.9" y="13.5" width="1.8" height="11.5" rx="0.9" />
        <rect x="43.4" y="13.5" width="1.8" height="11.5" rx="0.9" />
        <path d="M37 24h6a3 3 0 0 1 3 3c0 3-2.2 5.2-5 5.6L40.4 50.5a1.4 1.4 0 0 1-2.8 0L38 32.6c-2.8-.4-5-2.6-5-5.6a3 3 0 0 1 3-3z" />
      </g>
    </svg>
  );
}
