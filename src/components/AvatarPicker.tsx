"use client";

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatarId: string) => void;
}

export const avatarList = [
  { id: "a1", bg: "#ffd6e0", skin: "#FDDBB4", hair: "#3b1f0e", hairStyle: "long" },
  { id: "a2", bg: "#d6f0ff", skin: "#FDDBB4", hair: "#1a1a2e", hairStyle: "bun" },
  { id: "a3", bg: "#e8d6ff", skin: "#c68642", hair: "#2c1810", hairStyle: "short" },
  { id: "a4", bg: "#d6ffe8", skin: "#FDDBB4", hair: "#7b3f00", hairStyle: "wavy" },
  { id: "a5", bg: "#fff3d6", skin: "#f1c27d", hair: "#1a1a1a", hairStyle: "long" },
  { id: "a6", bg: "#ffd6f0", skin: "#c68642", hair: "#4a0e0e", hairStyle: "bun" },
  { id: "a7", bg: "#d6d6ff", skin: "#FDDBB4", hair: "#2d4a1e", hairStyle: "short" },
  { id: "a8", bg: "#ffe8d6", skin: "#f1c27d", hair: "#1a1a2e", hairStyle: "wavy" },
  { id: "a9", bg: "#f0ffd6", skin: "#FDDBB4", hair: "#3b1f0e", hairStyle: "bun" },
  { id: "a10", bg: "#ffd6d6", skin: "#c68642", hair: "#1a1a1a", hairStyle: "long" },
  { id: "a11", bg: "#d6fff0", skin: "#f1c27d", hair: "#7b3f00", hairStyle: "short" },
  { id: "a12", bg: "#f0d6ff", skin: "#FDDBB4", hair: "#2c1810", hairStyle: "wavy" },
];

function HairLong({ color }: { color: string }) {
  return (
    <>
      <ellipse cx="50" cy="38" rx="22" ry="24" fill={color} />
      <rect x="28" y="45" width="8" height="30" rx="4" fill={color} />
      <rect x="64" y="45" width="8" height="30" rx="4" fill={color} />
    </>
  );
}

function HairBun({ color }: { color: string }) {
  return (
    <>
      <ellipse cx="50" cy="38" rx="22" ry="20" fill={color} />
      <circle cx="50" cy="18" r="9" fill={color} />
      <rect x="28" y="48" width="7" height="18" rx="3.5" fill={color} />
      <rect x="65" y="48" width="7" height="18" rx="3.5" fill={color} />
    </>
  );
}

function HairShort({ color }: { color: string }) {
  return (
    <>
      <ellipse cx="50" cy="38" rx="22" ry="20" fill={color} />
      <rect x="28" y="45" width="7" height="14" rx="3.5" fill={color} />
      <rect x="65" y="45" width="7" height="14" rx="3.5" fill={color} />
    </>
  );
}

function HairWavy({ color }: { color: string }) {
  return (
    <>
      <ellipse cx="50" cy="38" rx="22" ry="22" fill={color} />
      <path d="M28 50 Q24 60 28 70 Q24 80 28 88" stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M72 50 Q76 60 72 70 Q76 80 72 88" stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" />
    </>
  );
}

function AvatarSVG({ bg, skin, hair, hairStyle }: { bg: string; skin: string; hair: string; hairStyle: string }) {
  const HairComponent = {
    long: HairLong,
    bun: HairBun,
    short: HairShort,
    wavy: HairWavy,
  }[hairStyle] ?? HairLong;

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background */}
      <circle cx="50" cy="50" r="50" fill={bg} />

      {/* Hair behind */}
      <HairComponent color={hair} />

      {/* Neck */}
      <rect x="44" y="62" width="12" height="12" rx="4" fill={skin} />

      {/* Body */}
      <ellipse cx="50" cy="85" rx="18" ry="14" fill="#f9a8d4" />

      {/* Face */}
      <ellipse cx="50" cy="48" rx="18" ry="20" fill={skin} />

      {/* Eyes */}
      <ellipse cx="43" cy="46" rx="2.5" ry="3" fill="#1a1a2e" />
      <ellipse cx="57" cy="46" rx="2.5" ry="3" fill="#1a1a2e" />
      {/* Eye shine */}
      <circle cx="44.2" cy="44.8" r="1" fill="white" />
      <circle cx="58.2" cy="44.8" r="1" fill="white" />

      {/* Blush */}
      <ellipse cx="38" cy="52" rx="5" ry="3" fill="#ffb3c6" opacity="0.5" />
      <ellipse cx="62" cy="52" rx="5" ry="3" fill="#ffb3c6" opacity="0.5" />

      {/* Nose */}
      <ellipse cx="50" cy="51" rx="1.5" ry="1" fill="#e8a87c" opacity="0.6" />

      {/* Smile */}
      <path d="M45 56 Q50 61 55 56" stroke="#c97a8a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function avatarUrl(id: string) {
  return id;
}

export default function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-gray-500">Charakter wählen ✨</p>
      <div className="grid grid-cols-4 gap-3">
        {avatarList.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            className="rounded-2xl aspect-square overflow-hidden transition-all"
            style={{
              border: selected === a.id ? "3px solid #fb7185" : "3px solid #f3f4f6",
              transform: selected === a.id ? "scale(1.08)" : "scale(1)",
              boxShadow: selected === a.id ? "0 4px 16px #fb718560" : "none",
            }}
          >
            <AvatarSVG
              bg={a.bg}
              skin={a.skin}
              hair={a.hair}
              hairStyle={a.hairStyle}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export { AvatarSVG };
