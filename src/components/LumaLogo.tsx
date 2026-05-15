export default function LumaLogo({ size = 1 }: { size?: number }) {
  const w = 160 * size;
  const h = 200 * size;

  return (
    <svg width={w} height={h} viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg">
      {/* Glow behind moon */}
      <ellipse cx="72" cy="62" rx="38" ry="38" fill="#b799e5" opacity="0.18" />

      {/* Moon shape */}
      <path
        d="M72 28 A34 34 0 1 0 72 96 A22 22 0 1 1 72 28 Z"
        fill="#b799e5"
      />

      {/* Moon inner shine */}
      <ellipse cx="60" cy="44" rx="6" ry="9" fill="#fff" opacity="0.18" transform="rotate(-20 60 44)" />

      {/* Rose flower left */}
      <g transform="translate(100 48)">
        <circle cx="0" cy="0" r="5" fill="#ec6f9e" />
        <ellipse cx="-6" cy="-4" rx="4" ry="3" fill="#ec6f9e" transform="rotate(-40 -6 -4)" />
        <ellipse cx="6" cy="-4" rx="4" ry="3" fill="#ec6f9e" transform="rotate(40 6 -4)" />
        <ellipse cx="-6" cy="4" rx="4" ry="3" fill="#ec6f9e" transform="rotate(40 -6 4)" />
        <ellipse cx="6" cy="4" rx="4" ry="3" fill="#ec6f9e" transform="rotate(-40 6 4)" />
        <circle cx="0" cy="0" r="3" fill="#b799e5" />
        {/* stem */}
        <line x1="0" y1="5" x2="-4" y2="16" stroke="#cfe8d5" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="-6" cy="13" rx="3" ry="2" fill="#cfe8d5" transform="rotate(-30 -6 13)" />
      </g>

      {/* Rose flower right (smaller) */}
      <g transform="translate(116 68)">
        <circle cx="0" cy="0" r="4" fill="#ffd9c7" />
        <ellipse cx="-5" cy="-3" rx="3.5" ry="2.5" fill="#ffd9c7" transform="rotate(-40 -5 -3)" />
        <ellipse cx="5" cy="-3" rx="3.5" ry="2.5" fill="#ffd9c7" transform="rotate(40 5 -3)" />
        <ellipse cx="-5" cy="3" rx="3.5" ry="2.5" fill="#ffd9c7" transform="rotate(40 -5 3)" />
        <ellipse cx="5" cy="3" rx="3.5" ry="2.5" fill="#ffd9c7" transform="rotate(-40 5 3)" />
        <circle cx="0" cy="0" r="2.5" fill="#b799e5" />
        {/* stem */}
        <line x1="0" y1="4" x2="3" y2="14" stroke="#cfe8d5" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="5" cy="11" rx="2.5" ry="1.8" fill="#cfe8d5" transform="rotate(30 5 11)" />
      </g>

      {/* Small stars / sparkles */}
      <g fill="#b799e5" opacity="0.7">
        <circle cx="108" cy="32" r="1.5" />
        <circle cx="120" cy="44" r="1" />
        <circle cx="104" cy="80" r="1" />
        <circle cx="38" cy="36" r="1.2" />
        <circle cx="30" cy="58" r="1" />
      </g>

      {/* LUMA text */}
      <text
        x="80" y="120"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="32"
        fontWeight="300"
        letterSpacing="6"
        fill="#b799e5"
      >
        LUMA
      </text>

      {/* Thin line under LUMA */}
      <line x1="44" y1="128" x2="116" y2="128" stroke="#b799e5" strokeWidth="0.8" opacity="0.6" />

      {/* Tagline with hearts */}
      <text
        x="80" y="152"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="9"
        letterSpacing="1.5"
        fill="#ec6f9e"
      >
        glow with care
      </text>

      {/* Small hearts */}
      <g fill="#ec6f9e">
        {/* left heart */}
        <path d="M30 145 C30 142 27 140 25 142 C23 140 20 142 20 145 C20 148 25 153 25 153 C25 153 30 148 30 145 Z"
          transform="scale(0.6) translate(18 90)" />
        {/* right heart */}
        <path d="M30 145 C30 142 27 140 25 142 C23 140 20 142 20 145 C20 148 25 153 25 153 C25 153 30 148 30 145 Z"
          transform="scale(0.6) translate(155 90)" />
      </g>
    </svg>
  );
}

