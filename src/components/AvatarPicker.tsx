"use client";

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatarId: string) => void;
}

export const avatarList = [
  { id: "a1",  bg: "#ffd6e8", skin: "#fde8d0", hair: "#3b1f0e", hairStyle: "long",  top: "#f4c7d7" },
  { id: "a2",  bg: "#e0d6ff", skin: "#fde8d0", hair: "#1a1a2e", hairStyle: "bun",   top: "#b799e5" },
  { id: "a3",  bg: "#d6f0e8", skin: "#d4956a", hair: "#2c1810", hairStyle: "curly", top: "#cfe8d5" },
  { id: "a4",  bg: "#fff3d6", skin: "#fde8d0", hair: "#7b3f00", hairStyle: "long",  top: "#ffd9c7" },
  { id: "a5",  bg: "#ffd6f5", skin: "#f1c27d", hair: "#1a1a1a", hairStyle: "short", top: "#f4c7d7" },
  { id: "a6",  bg: "#d6e8ff", skin: "#d4956a", hair: "#4a0e0e", hairStyle: "bun",   top: "#b799e5" },
  { id: "a7",  bg: "#e8ffd6", skin: "#fde8d0", hair: "#2d4a1e", hairStyle: "pixie", top: "#cfe8d5" },
  { id: "a8",  bg: "#ffe8d6", skin: "#f1c27d", hair: "#1a1a2e", hairStyle: "long",  top: "#ffd9c7" },
  { id: "a9",  bg: "#f5d6ff", skin: "#fde8d0", hair: "#3b1f0e", hairStyle: "curly", top: "#b799e5" },
  { id: "a10", bg: "#d6fff5", skin: "#d4956a", hair: "#1a1a1a", hairStyle: "short", top: "#cfe8d5" },
  { id: "a11", bg: "#ffd6d6", skin: "#f1c27d", hair: "#7b3f00", hairStyle: "bun",   top: "#f4c7d7" },
  { id: "a12", bg: "#d6f5ff", skin: "#fde8d0", hair: "#2c1810", hairStyle: "pixie", top: "#b799e5" },
];

function Hair({ style, color }: { style: string; color: string }) {
  switch (style) {
    case "long":
      return (
        <>
          <ellipse cx="50" cy="34" rx="20" ry="22" fill={color} />
          <rect x="30" y="44" width="7" height="32" rx="3.5" fill={color} />
          <rect x="63" y="44" width="7" height="32" rx="3.5" fill={color} />
        </>
      );
    case "bun":
      return (
        <>
          <ellipse cx="50" cy="36" rx="20" ry="19" fill={color} />
          <circle cx="50" cy="16" r="10" fill={color} />
          <circle cx="50" cy="16" r="5" fill={color} opacity="0.6" />
        </>
      );
    case "curly":
      return (
        <>
          <ellipse cx="50" cy="34" rx="22" ry="20" fill={color} />
          <circle cx="28" cy="38" r="8" fill={color} />
          <circle cx="72" cy="38" r="8" fill={color} />
          <circle cx="32" cy="52" r="6" fill={color} />
          <circle cx="68" cy="52" r="6" fill={color} />
        </>
      );
    case "short":
      return (
        <>
          <ellipse cx="50" cy="34" rx="20" ry="18" fill={color} />
          <rect x="30" y="42" width="7" height="10" rx="3.5" fill={color} />
          <rect x="63" y="42" width="7" height="10" rx="3.5" fill={color} />
        </>
      );
    case "pixie":
      return (
        <>
          <ellipse cx="50" cy="32" rx="20" ry="17" fill={color} />
          <ellipse cx="32" cy="34" rx="5" ry="9" fill={color} />
          <ellipse cx="68" cy="34" rx="5" ry="9" fill={color} />
          <ellipse cx="50" cy="18" rx="14" ry="8" fill={color} />
        </>
      );
    default:
      return <ellipse cx="50" cy="34" rx="20" ry="20" fill={color} />;
  }
}

export function AvatarSVG({ bg, skin, hair, hairStyle, top }: {
  bg: string; skin: string; hair: string; hairStyle: string; top: string;
}) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background */}
      <circle cx="50" cy="50" r="50" fill={bg} />

      {/* Hair (behind face) */}
      <Hair style={hairStyle} color={hair} />

      {/* Neck */}
      <rect x="44" y="60" width="12" height="10" rx="5" fill={skin} />

      {/* Body / Top */}
      <ellipse cx="50" cy="88" rx="20" ry="16" fill={top} />

      {/* Face */}
      <ellipse cx="50" cy="46" rx="18" ry="20" fill={skin} />

      {/* Ears */}
      <ellipse cx="31" cy="47" rx="3.5" ry="4.5" fill={skin} />
      <ellipse cx="69" cy="47" rx="3.5" ry="4.5" fill={skin} />

      {/* Blush */}
      <ellipse cx="37" cy="52" rx="6" ry="3.5" fill="#ffb3c6" opacity="0.4" />
      <ellipse cx="63" cy="52" rx="6" ry="3.5" fill="#ffb3c6" opacity="0.4" />

      {/* Eyes — big cute with blink */}
      <g className="avatar-eye avatar-eye-left">
        <ellipse cx="42" cy="45" rx="4" ry="4.5" fill="#1a1a2e" />
        <circle cx="43.5" cy="43" r="1.5" fill="white" />
        <circle cx="44.8" cy="46" r="0.8" fill="white" opacity="0.6" />
      </g>
      <g className="avatar-eye avatar-eye-right">
        <ellipse cx="58" cy="45" rx="4" ry="4.5" fill="#1a1a2e" />
        <circle cx="59.5" cy="43" r="1.5" fill="white" />
        <circle cx="60.8" cy="46" r="0.8" fill="white" opacity="0.6" />
      </g>

      {/* Eyelashes */}
      <line x1="39" y1="41.5" x2="37.5" y2="39.5" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" />
      <line x1="42" y1="40.5" x2="42" y2="38.5" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" />
      <line x1="45" y1="41" x2="46" y2="39" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" />
      <line x1="55" y1="41" x2="54" y2="39" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" />
      <line x1="58" y1="40.5" x2="58" y2="38.5" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" />
      <line x1="61" y1="41.5" x2="62.5" y2="39.5" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" />

      {/* Nose — tiny dot */}
      <circle cx="50" cy="52" r="1.2" fill={skin === "#fde8d0" ? "#e8a87c" : "#b87040"} opacity="0.5" />

      {/* Mouth — cute smile */}
      <path d="M44 57 Q50 63 56 57" stroke="#d4748a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function avatarUrl(id: string) { return id; }

export default function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs tracking-widest" style={{ color: "#b799e5" }}>CHARAKTER WÄHLEN</p>
      <div className="grid grid-cols-4 gap-3">
        {avatarList.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            className="rounded-2xl aspect-square overflow-hidden transition-all"
            style={{
              border: selected === a.id ? `2.5px solid #b799e5` : "2.5px solid transparent",
              transform: selected === a.id ? "scale(1.08)" : "scale(1)",
              boxShadow: selected === a.id ? "0 4px 16px #b799e540" : "none",
            }}
          >
            <AvatarSVG bg={a.bg} skin={a.skin} hair={a.hair} hairStyle={a.hairStyle} top={a.top} />
          </button>
        ))}
      </div>
    </div>
  );
}
