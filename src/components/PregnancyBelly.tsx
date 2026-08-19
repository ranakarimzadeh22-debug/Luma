"use client";

interface PregnancyBellyProps {
  week: number;
  fruitName?: string;
  fruitEmoji?: string;
  sizeCm?: number;
  weightG?: number;
}

/**
 * Side-profile SVG of a pregnant woman with a dynamic fruit/embryo
 * visible inside the belly. The fruit scales and changes appearance
 * based on the pregnancy week.
 */

interface FruitVisual {
  path: string;
  color: string;
  secondaryColor?: string;
  label: string;
  scale: number; // relative to its display size within the belly window
  cx: number; // center x offset relative to belly window center
  cy: number; // center y offset relative to belly window center
}

const fruitVisuals: Record<number, FruitVisual> = {
  // Early weeks: embryo phase (abstract shapes)
  1: {
    path: "M-2,-3 Q0,-5 2,-3 Q4,-1 2,1 Q0,3 -2,1 Q-4,-1 -2,-3Z",
    color: "#e8c8b0",
    label: "Embryo",
    scale: 0.3,
    cx: 0, cy: 0,
  },
  2: {
    path: "M-3,-4 Q0,-6 3,-4 Q5,-1 3,2 Q0,4 -3,2 Q-5,-1 -3,-4Z",
    color: "#d4a8c8",
    label: "Embryo",
    scale: 0.35,
    cx: 0, cy: 0,
  },
  3: {
    path: "M-3,-4 Q0,-7 3,-4 Q6,-1 3,2 Q0,5 -3,2 Q-6,-1 -3,-4Z",
    color: "#c484c0",
    label: "Embryo",
    scale: 0.4,
    cx: 0, cy: -1,
  },
  // Week 4: Blaubeere (blueberry)
  4: {
    path: "M0,-5 C4,-5 7,-2 7,2 C7,6 4,9 0,9 C-4,9 -7,6 -7,2 C-7,-2 -4,-5 0,-5Z",
    color: "#4a6fa5",
    secondaryColor: "#6b8fc7",
    label: "Blaubeere",
    scale: 0.5,
    cx: 0, cy: -1,
  },
  5: {
    path: "M0,-5 C4,-5 7,-2 7,2 C7,6 4,9 0,9 C-4,9 -7,6 -7,2 C-7,-2 -4,-5 0,-5Z",
    color: "#4a6fa5",
    secondaryColor: "#6b8fc7",
    label: "Blaubeere",
    scale: 0.6,
    cx: 0, cy: -1,
  },
  // Week 6: Apfelsamen / small seed
  6: {
    path: "M0,-3 C3,-3 5,-1 5,2 C5,5 3,7 0,7 C-3,7 -5,5 -5,2 C-5,-1 -3,-3 0,-3Z",
    color: "#7a5a3e",
    label: "Apfelsamen",
    scale: 0.45,
    cx: 0, cy: 0,
  },
  // Week 7: Erbse (pea)
  7: {
    path: "M0,-6 C5,-6 9,-3 9,1 C9,5 5,8 0,8 C-5,8 -9,5 -9,1 C-9,-3 -5,-6 0,-6Z",
    color: "#6bb86b",
    secondaryColor: "#8fd48f",
    label: "Erbse",
    scale: 0.55,
    cx: 0, cy: 0,
  },
  // Week 8: Himbeere (raspberry)
  8: {
    path: "M0,-7 C4,-7 8,-4 8,0 C8,4 6,7 3,9 L2,8 L1,9 L0,8 L-1,9 L-2,8 L-3,9 C-6,7 -8,4 -8,0 C-8,-4 -4,-7 0,-7Z",
    color: "#d44a6a",
    secondaryColor: "#e87890",
    label: "Himbeere",
    scale: 0.55,
    cx: 0, cy: 0,
  },
  // Week 9: Kirsche (cherry)
  9: {
    path: "M0,-7 C5,-7 9,-4 9,1 C9,6 5,9 0,9 C-5,9 -9,6 -9,1 C-9,-4 -5,-7 0,-7Z",
    color: "#b8324a",
    secondaryColor: "#d46070",
    label: "Kirsche",
    scale: 0.55,
    cx: 0, cy: 0,
  },
  // Week 10: Pflaume (plum)
  10: {
    path: "M0,-8 C5,-8 9,-4 9,0 C9,5 5,9 0,9 C-5,9 -9,5 -9,0 C-9,-4 -5,-8 0,-8Z",
    color: "#6b3a7a",
    secondaryColor: "#9a5aad",
    label: "Pflaume",
    scale: 0.6,
    cx: 0, cy: -1,
  },
  // Week 12: Feige (fig)
  12: {
    path: "M0,-9 C6,-9 10,-5 10,0 C10,5 6,9 0,9 C-6,9 -10,5 -10,0 C-10,-5 -6,-9 0,-9Z",
    color: "#8a4a5a",
    secondaryColor: "#b87a8a",
    label: "Feige",
    scale: 0.65,
    cx: 0, cy: -1,
  },
  // Week 14: Limette (lime)
  14: {
    path: "M0,-10 C6,-10 11,-5 11,1 C11,7 6,11 0,11 C-6,11 -11,7 -11,1 C-11,-5 -6,-10 0,-10Z",
    color: "#5aad4a",
    secondaryColor: "#8ad47a",
    label: "Limette",
    scale: 0.65,
    cx: 0, cy: 0,
  },
  // Week 16: Pfirsich (peach)
  16: {
    path: "M0,-11 C6,-11 12,-5 12,1 C12,7 6,12 0,12 C-6,12 -12,7 -12,1 C-12,-5 -6,-11 0,-11Z",
    color: "#e8a070",
    secondaryColor: "#f4c4a0",
    label: "Pfirsich",
    scale: 0.7,
    cx: 0, cy: 0,
  },
  // Week 18: Zitrone (lemon)
  18: {
    path: "M0,-12 C7,-12 13,-6 13,0 C13,6 7,13 0,13 C-7,13 -13,6 -13,0 C-13,-6 -7,-12 0,-12Z",
    color: "#e8d440",
    secondaryColor: "#f0e878",
    label: "Zitrone",
    scale: 0.7,
    cx: 0, cy: 0,
  },
  // Week 20: Apfel (apple)
  20: {
    path: "M0,-13 C7,-13 14,-6 14,1 C14,8 7,14 0,14 C-7,14 -14,8 -14,1 C-14,-6 -7,-13 0,-13Z",
    color: "#d44030",
    secondaryColor: "#e87860",
    label: "Apfel",
    scale: 0.75,
    cx: 0, cy: 0,
  },
  // Week 22: Avocado
  22: {
    path: "M0,-14 C8,-14 15,-7 15,0 C15,7 8,15 0,15 C-8,15 -15,7 -15,0 C-15,-7 -8,-14 0,-14Z",
    color: "#4a8a3a",
    secondaryColor: "#7ab86a",
    label: "Avocado",
    scale: 0.75,
    cx: 0, cy: 0,
  },
  // Week 24: Birne (pear)
  24: {
    path: "M0,-15 C8,-15 16,-8 16,0 C16,8 8,16 0,16 C-8,16 -16,8 -16,0 C-16,-8 -8,-15 0,-15Z",
    color: "#8aba3a",
    secondaryColor: "#b0d870",
    label: "Birne",
    scale: 0.8,
    cx: 0, cy: 0,
  },
  // Week 26: Paprika (bell pepper)
  26: {
    path: "M0,-16 C9,-16 17,-9 17,-1 C17,6 12,12 6,16 L3,15 L0,17 L-3,15 L-6,16 C-12,12 -17,6 -17,-1 C-17,-9 -9,-16 0,-16Z",
    color: "#d47030",
    secondaryColor: "#e8a070",
    label: "Paprika",
    scale: 0.8,
    cx: 0, cy: -1,
  },
  // Week 28: Mango
  28: {
    path: "M0,-17 C10,-17 18,-10 18,-2 C18,5 14,11 8,16 C4,18 -4,18 -8,16 C-14,11 -18,5 -18,-2 C-18,-10 -10,-17 0,-17Z",
    color: "#e8b830",
    secondaryColor: "#f0d870",
    label: "Mango",
    scale: 0.85,
    cx: 0, cy: 0,
  },
  // Week 30: Banane (banana shape as crescent)
  30: {
    path: "M-12,-8 C-16,-4 -18,2 -16,8 C-14,14 -8,17 -2,17 L-2,14 C-7,14 -11,12 -13,7 C-14,3 -13,-2 -10,-5 Z",
    color: "#e8d030",
    secondaryColor: "#f0e060",
    label: "Banane",
    scale: 0.85,
    cx: 0, cy: 0,
  },
  // Week 32: Karotte (carrot)
  32: {
    path: "M0,-18 C6,-16 10,-10 10,-3 C10,3 8,8 5,11 C2,14 -2,14 -5,11 C-8,8 -10,3 -10,-3 C-10,-10 -6,-16 0,-18Z",
    color: "#e88020",
    secondaryColor: "#f0a860",
    label: "Karotte",
    scale: 0.85,
    cx: 0, cy: 0,
  },
  // Week 34: Kokosnuss (coconut)
  34: {
    path: "M0,-18 C10,-18 19,-10 19,0 C19,10 10,18 0,18 C-10,18 -19,10 -19,0 C-19,-10 -10,-18 0,-18Z",
    color: "#7a5a3a",
    secondaryColor: "#a08060",
    label: "Kokosnuss",
    scale: 0.9,
    cx: 0, cy: 0,
  },
  // Week 36: Grapefruit
  36: {
    path: "M0,-19 C11,-19 20,-10 20,0 C20,10 11,19 0,19 C-11,19 -20,10 -20,0 C-20,-10 -11,-19 0,-19Z",
    color: "#e87030",
    secondaryColor: "#f0a878",
    label: "Grapefruit",
    scale: 0.9,
    cx: 0, cy: 0,
  },
  // Week 38: Kohlrabi / Zucchini
  38: {
    path: "M0,-20 C12,-20 21,-11 21,-1 C21,6 17,12 11,16 C7,18 -7,18 -11,16 C-17,12 -21,6 -21,-1 C-21,-11 -12,-20 0,-20Z",
    color: "#6aaa4a",
    secondaryColor: "#8ad470",
    label: "Zucchini",
    scale: 0.95,
    cx: 0, cy: 0,
  },
  // Week 40: Wassermelone (watermelon)
  40: {
    path: "M0,-22 C13,-22 23,-12 23,0 C23,12 13,22 0,22 C-13,22 -23,12 -23,0 C-23,-12 -13,-22 0,-22Z",
    color: "#30a040",
    secondaryColor: "#60c870",
    label: "Wassermelone",
    scale: 1.0,
    cx: 0, cy: 0,
  },
};

function getFruitVisual(week: number): FruitVisual {
  // Find the closest defined week visual (rounding down to nearest defined week)
  const definedWeeks = Object.keys(fruitVisuals).map(Number).sort((a, b) => a - b);
  let closest = definedWeeks[0];
  for (const w of definedWeeks) {
    if (w <= week) closest = w;
  }
  // For weeks between defined ones, interpolate the scale
  const base = fruitVisuals[closest];
  // Find next defined week for interpolation
  let nextWeek = closest;
  for (const w of definedWeeks) {
    if (w > week) { nextWeek = w; break; }
  }
  if (nextWeek === closest || !fruitVisuals[nextWeek]) return base;

  const next = fruitVisuals[nextWeek];
  const t = (week - closest) / (nextWeek - closest);
  const scale = base.scale + (next.scale - base.scale) * t;
  return { ...base, scale };
}

export default function PregnancyBelly({
  week,
  fruitName,
  fruitEmoji,
  sizeCm,
  weightG,
}: PregnancyBellyProps) {
  const fv = getFruitVisual(week);

  // Belly bump scale: grows from week 4 to week 40
  const bellyProportion = Math.min(1, Math.max(0.35, 0.35 + (week / 40) * 0.65));
  const bellyRx = 22 + bellyProportion * 20; // horizontal radius
  const bellyRy = 18 + bellyProportion * 22; // vertical radius

  // Window for the fruit inside the belly (slightly smaller, positioned inside)
  const windowRx = bellyRx * 0.55;
  const windowRy = bellyRy * 0.55;

  // Fruit display size relative to the window
  const fruitDisplaySize = fv.scale * Math.min(windowRx, windowRy) * 0.7;

  // Color palette
  const skinColor = "#fce4d6";
  const skinStroke = "#e8c8b0";
  const dressColor = "#b799e5";
  const dressStroke = "#9a7fc9";

  return (
    <svg
      viewBox="0 0 200 260"
      className="w-full max-w-[240px] mx-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ===== HAIR ===== */}
      {/* Hair flowing back (side profile) */}
      <path
        d="M112,38 C118,30 128,26 136,30 C144,34 148,44 146,56 C144,68 138,76 130,78 Q122,80 118,72 Q114,64 116,54 Q112,60 108,58 Q104,56 106,48 Q108,40 112,38Z"
        fill="#5a3e2b"
      />
      {/* Hair strand on top */}
      <path
        d="M112,38 C108,28 110,18 118,14 C126,10 134,14 136,20 C138,26 134,32 130,30 C126,28 122,30 118,34 Q115,36 112,38Z"
        fill="#5a3e2b"
      />

      {/* ===== HEAD (side profile, facing left) ===== */}
      {/* Face silhouette */}
      <path
        d="M118,30 C126,26 138,28 144,34 C150,40 152,48 150,56 C148,64 142,70 134,74 C126,78 118,76 114,68 C110,60 110,48 114,40 Q116,34 118,30Z"
        fill={skinColor}
        stroke={skinStroke}
        strokeWidth="0.8"
      />

      {/* Nose */}
      <path
        d="M144,42 C146,44 146,48 142,50"
        stroke={skinStroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Eye */}
      <ellipse cx="128" cy="40" rx="2" ry="1.8" fill="#3a2d3f" />
      <ellipse cx="130" cy="39" rx="0.8" ry="0.8" fill="white" opacity="0.6" />

      {/* Eyebrow */}
      <path
        d="M124,36 C127,34 132,34 135,36"
        stroke="#5a3e2b"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Blush */}
      <ellipse cx="118" cy="48" rx="4" ry="2.5" fill="#f4c7d7" opacity="0.4" />

      {/* Lips */}
      <path
        d="M142,50 C144,52 142,54 140,54 C138,54 136,52 138,50Z"
        fill="#c4845a"
      />

      {/* Ear */}
      <ellipse cx="114" cy="38" rx="3" ry="4" fill={skinColor} stroke={skinStroke} strokeWidth="0.6" />

      {/* ===== NECK ===== */}
      <rect x="125" y="72" width="10" height="8" rx="3" fill={skinColor} />

      {/* ===== UPPER BODY / DRESS (side profile) ===== */}
      {/* Back */}
      <path
        d="M130,80 C124,90 118,104 116,118 C114,132 114,140 116,150"
        stroke={dressColor}
        strokeWidth="2"
        fill="none"
      />
      {/* Front / chest */}
      <path
        d="M140,80 C146,92 150,106 150,118 C150,128 148,136 144,144"
        stroke={dressColor}
        strokeWidth="2"
        fill="none"
      />

      {/* Dress fill */}
      <path
        d="M130,80 C124,90 118,104 116,118 C114,132 114,144 116,156 L144,156 C148,148 150,138 150,128 C150,116 148,104 140,80Z"
        fill={dressColor}
        stroke={dressStroke}
        strokeWidth="0.8"
      />

      {/* ===== BELLY BUMP ===== */}
      {/* Belly outline (dress stretching over belly) */}
      <ellipse
        cx={118 + bellyRx * 0.5}
        cy={140}
        rx={bellyRx}
        ry={bellyRy}
        fill={skinColor}
        stroke={skinStroke}
        strokeWidth="1"
      />

      {/* Belly highlight */}
      <ellipse
        cx={118 + bellyRx * 0.5 - bellyRx * 0.15}
        cy={140 - bellyRy * 0.15}
        rx={bellyRx * 0.2}
        ry={bellyRy * 0.25}
        fill="white"
        opacity="0.25"
      />

      {/* ===== BELLY "WINDOW" — visible fruit/embryo ===== */}
      {/* The "window" overlay */}
      <clipPath id="belly-window">
        <ellipse
          cx={118 + bellyRx * 0.5}
          cy={140}
          rx={windowRx}
          ry={windowRy}
        />
      </clipPath>

      {/* Window background (slightly translucent) */}
      <ellipse
        cx={118 + bellyRx * 0.5}
        cy={140}
        rx={windowRx}
        ry={windowRy}
        fill="rgba(252, 228, 214, 0.3)"
      />

      {/* Fruit/Embryo inside the belly window */}
      <g clipPath="url(#belly-window)">
        <g
          transform={`
            translate(${118 + bellyRx * 0.5 + fv.cx * fruitDisplaySize * 0.1}, ${140 + fv.cy * fruitDisplaySize * 0.1})
            scale(${fruitDisplaySize / 10})
          `}
        >
          {/* Main fruit shape */}
          <path d={fv.path} fill={fv.color} opacity={0.9} />
          {/* Secondary color highlight */}
          {fv.secondaryColor && (
            <path
              d={fv.path}
              fill={fv.secondaryColor}
              opacity={0.3}
              transform="translate(-1, -1) scale(0.8)"
            />
          )}
          {/* Shine/sparkle on fruit */}
          <ellipse
            cx={-fruitDisplaySize * 0.15}
            cy={-fruitDisplaySize * 0.2}
            rx={fruitDisplaySize * 0.08}
            ry={fruitDisplaySize * 0.1}
            fill="white"
            opacity={0.3}
          />
        </g>
      </g>

      {/* ===== ARMS ===== */}
      {/* Left arm (forward, resting on belly) */}
      <path
        d="M130,100 C124,110 120,118 122,130 C124,138 128,142 132,144"
        stroke={skinColor}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right arm (behind back, partially hidden) */}
      <path
        d="M116,104 C110,112 106,120 108,130"
        stroke={skinColor}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* ===== LEGS ===== */}
      {/* Front leg */}
      <rect x="128" y="154" width="10" height="30" rx="4" fill={skinColor} />
      {/* Back leg */}
      <rect x="142" y="154" width="10" height="30" rx="4" fill={skinColor} opacity="0.8" />

      {/* ===== FEET / SHOES ===== */}
      <ellipse cx="133" cy="185" rx="8" ry="3.5" fill={dressColor} />
      <ellipse cx="147" cy="185" rx="8" ry="3.5" fill={dressColor} opacity="0.85" />

      {/* ===== SIZE & WEIGHT LABELS ===== */}
      {sizeCm && (
        <g transform="translate(100, 210)">
          <rect x="-30" y="-10" width="60" height="20" rx="10" fill="white" opacity="0.85" />
          <text
            x="0" y="3"
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="#3a2d3f"
            fontFamily="system-ui, sans-serif"
          >
            {sizeCm} cm
          </text>
        </g>
      )}
      {weightG !== undefined && weightG > 0 && (
        <g transform="translate(100, 232)">
          <rect x="-30" y="-10" width="60" height="20" rx="10" fill="white" opacity="0.85" />
          <text
            x="0" y="3"
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="#b799e5"
            fontFamily="system-ui, sans-serif"
          >
            {weightG} g
          </text>
        </g>
      )}

      {/* Week badge */}
      <g transform="translate(160, 32)">
        <rect x="-22" y="-12" width="44" height="24" rx="12" fill="#cfe8d5" />
        <text
          x="0" y="2"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill="#3a2d3f"
          fontFamily="system-ui, sans-serif"
        >
          SSW {week}
        </text>
      </g>

      {/* Fruit name with emoji at bottom */}
      {fruitName && fruitEmoji && (
        <g transform="translate(100, 252)">
          <text
            x="0" y="0"
            textAnchor="middle"
            fontSize="12"
            fontWeight="500"
            fill="#a094a8"
            fontFamily="system-ui, sans-serif"
          >
            {fruitEmoji} {fruitName}
          </text>
        </g>
      )}
    </svg>
  );
}