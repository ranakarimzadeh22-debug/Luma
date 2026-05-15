"use client";

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatarId: string) => void;
}

// Anime-style avatars using DiceBear "avataaars" style with cute seeds
const avatarList = [
  { id: "sakura",   seed: "sakura",   bg: "fecdd3" },
  { id: "yuki",     seed: "yuki",     bg: "fbcfe8" },
  { id: "hana",     seed: "hana",     bg: "f5d0fe" },
  { id: "momo",     seed: "momo",     bg: "fde68a" },
  { id: "luna",     seed: "luna",     bg: "bfdbfe" },
  { id: "nana",     seed: "nana",     bg: "bbf7d0" },
  { id: "kira",     seed: "kira",     bg: "fecdd3" },
  { id: "aoi",      seed: "aoi",      bg: "ddd6fe" },
  { id: "rina",     seed: "rina",     bg: "fbcfe8" },
  { id: "mika",     seed: "mika",     bg: "fed7aa" },
  { id: "sora",     seed: "sora",     bg: "bfdbfe" },
  { id: "yuna",     seed: "yuna",     bg: "f5d0fe" },
];

export function avatarUrl(id: string) {
  const a = avatarList.find((x) => x.id === id) ?? avatarList[0];
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${a.seed}&backgroundColor=${a.bg}&backgroundType=circle&top=longHair,straightHair,curly,wavyBob,straight02&accessories=prescription01,prescription02,round,sunglasses&facialHair=&clotheType=BlazerShirt,BlazerSweater,CollarSweater,GraphicShirt,Hoodie,Overall,ShirtCrewNeck,ShirtVNeck&eyes=close,cry,default,dizzy,eyeRoll,happy,hearts,side,squint,surprised,wink,winkWacky&eyebrow=default,defaultNatural,flatNatural,raisedExcited,raisedExcitedNatural,upDown&mouth=default,eating,smile,tongue,twinkle`;
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl(a.id)}
              alt={a.id}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export { avatarList };
