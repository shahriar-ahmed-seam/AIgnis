import type { ChannelId } from "../types";

/**
 * Brand channel icons as inline SVG (no external assets). Instagram uses its
 * signature gradient; TikTok its cyan/magenta offset glyph; Web a neutral globe.
 */
export function ChannelIcon({ id, size = 22 }: { id: ChannelId; size?: number }) {
  if (id === "instagram") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs>
          <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
            <stop offset="0%" stopColor="#fdf497" />
            <stop offset="5%" stopColor="#fdf497" />
            <stop offset="45%" stopColor="#fd5949" />
            <stop offset="60%" stopColor="#d6249f" />
            <stop offset="90%" stopColor="#285AEB" />
          </radialGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-grad)" />
        <rect x="6.2" y="6.2" width="11.6" height="11.6" rx="3.6" fill="none" stroke="#fff" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" strokeWidth="1.6" />
        <circle cx="16.4" cy="7.6" r="1.1" fill="#fff" />
      </svg>
    );
  }

  if (id === "tiktok") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="6" fill="#010101" />
        {/* offset cyan + magenta note for the signature look */}
        <path
          d="M15.6 6.2c.3 1.4 1.2 2.5 2.6 2.8v2.1c-1 0-1.9-.3-2.7-.8v4.3c0 2.2-1.8 3.9-4 3.9s-3.9-1.7-3.9-3.9 1.7-4 3.9-4c.2 0 .4 0 .6.1v2.2c-.2-.1-.4-.1-.6-.1-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8 1.9-.8 1.9-1.9V6.2h2.2z"
          fill="#25F4EE"
          transform="translate(-0.6 0.5)"
        />
        <path
          d="M15.6 6.2c.3 1.4 1.2 2.5 2.6 2.8v2.1c-1 0-1.9-.3-2.7-.8v4.3c0 2.2-1.8 3.9-4 3.9s-3.9-1.7-3.9-3.9 1.7-4 3.9-4c.2 0 .4 0 .6.1v2.2c-.2-.1-.4-.1-.6-.1-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8 1.9-.8 1.9-1.9V6.2h2.2z"
          fill="#FE2C55"
          transform="translate(0.6 -0.2)"
        />
        <path
          d="M15.6 6.2c.3 1.4 1.2 2.5 2.6 2.8v2.1c-1 0-1.9-.3-2.7-.8v4.3c0 2.2-1.8 3.9-4 3.9s-3.9-1.7-3.9-3.9 1.7-4 3.9-4c.2 0 .4 0 .6.1v2.2c-.2-.1-.4-.1-.6-.1-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8 1.9-.8 1.9-1.9V6.2h2.2z"
          fill="#fff"
        />
      </svg>
    );
  }

  // web
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#0e7490" />
      <circle cx="12" cy="12" r="6.4" fill="none" stroke="#e0f2fe" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="2.7" ry="6.4" fill="none" stroke="#e0f2fe" strokeWidth="1.3" />
      <line x1="5.6" y1="12" x2="18.4" y2="12" stroke="#e0f2fe" strokeWidth="1.3" />
    </svg>
  );
}
