export default function LumaLogo({ size = 1 }: { size?: number }) {
  const w = 160 * size;
  const h = 200 * size;

  return (
    <svg width={w} height={h} viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg">

      {/* Glow hinter Mond */}
      <ellipse cx="80" cy="62" rx="42" ry="42" fill="#b799e5" opacity="0.12" />

      {/* Sichelmond */}
      <path
        d="M80 22
           A40 40 0 1 0 80 102
           A26 26 0 1 1 80 22 Z"
        fill="#b799e5"
      />

      {/* Glanzreflex auf Mond */}
      <ellipse cx="65" cy="38" rx="5" ry="9" fill="#fff" opacity="0.2" transform="rotate(-25 65 38)" />

      {/* Kleine Blume links oben */}
      <g transform="translate(112 38)">
        <circle cx="0" cy="0" r="5.5" fill="#f4c7d7" />
        <ellipse cx="-6" cy="-4" rx="4" ry="3" fill="#f4c7d7" transform="rotate(-40 -6 -4)" />
        <ellipse cx="6" cy="-4" rx="4" ry="3" fill="#f4c7d7" transform="rotate(40 6 -4)" />
        <ellipse cx="-6" cy="4" rx="4" ry="3" fill="#f4c7d7" transform="rotate(40 -6 4)" />
        <ellipse cx="6" cy="4" rx="4" ry="3" fill="#f4c7d7" transform="rotate(-40 6 4)" />
        <circle cx="0" cy="0" r="3" fill="#b799e5" />
        <line x1="0" y1="6" x2="-3" y2="16" stroke="#cfe8d5" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="-5" cy="13" rx="3" ry="2" fill="#cfe8d5" transform="rotate(-30 -5 13)" />
      </g>

      {/* Kleine Blume rechts unten */}
      <g transform="translate(126 62)">
        <circle cx="0" cy="0" r="4" fill="#f4c7d7" opacity="0.8" />
        <ellipse cx="-5" cy="-3" rx="3" ry="2.5" fill="#f4c7d7" opacity="0.8" transform="rotate(-40 -5 -3)" />
        <ellipse cx="5" cy="-3" rx="3" ry="2.5" fill="#f4c7d7" opacity="0.8" transform="rotate(40 5 -3)" />
        <ellipse cx="-5" cy="3" rx="3" ry="2.5" fill="#f4c7d7" opacity="0.8" transform="rotate(40 -5 3)" />
        <ellipse cx="5" cy="3" rx="3" ry="2.5" fill="#f4c7d7" opacity="0.8" transform="rotate(-40 5 3)" />
        <circle cx="0" cy="0" r="2.5" fill="#b799e5" />
      </g>

      {/* Sternchen */}
      <g fill="#b799e5" opacity="0.5">
        <circle cx="118" cy="24" r="1.5" />
        <circle cx="132" cy="46" r="1" />
        <circle cx="36" cy="32" r="1.2" />
        <circle cx="28" cy="54" r="1" />
        <circle cx="42" cy="72" r="0.8" />
      </g>

      {/* LUMA */}
      <text
        x="80" y="122"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="32"
        fontWeight="300"
        letterSpacing="7"
        fill="#b799e5"
      >
        LUMA
      </text>

      {/* Linie */}
      <line x1="42" y1="130" x2="118" y2="130" stroke="#b799e5" strokeWidth="0.8" opacity="0.4" />

      {/* glow with care */}
      <text
        x="80" y="152"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="9"
        letterSpacing="2"
        fill="#f4c7d7"
      >
        glow with care
      </text>

      {/* Herzen */}
      <g fill="#f4c7d7">
        <path d="M30 145 C30 142 27 140 25 142 C23 140 20 142 20 145 C20 148 25 153 25 153 C25 153 30 148 30 145 Z"
          transform="scale(0.6) translate(18 90)" />
        <path d="M30 145 C30 142 27 140 25 142 C23 140 20 142 20 145 C20 148 25 153 25 153 C25 153 30 148 30 145 Z"
          transform="scale(0.6) translate(155 90)" />
      </g>
    </svg>
  );
}
