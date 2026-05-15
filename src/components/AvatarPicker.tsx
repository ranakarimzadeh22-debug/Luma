"use client";

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatarId: string) => void;
}

const avatarList = [
  { id: "Luma1",  seed: "Luma1" },
  { id: "Luma2",  seed: "Luma2" },
  { id: "Luma3",  seed: "Luma3" },
  { id: "Luma4",  seed: "Luma4" },
  { id: "Luma5",  seed: "Luma5" },
  { id: "Luma6",  seed: "Luma6" },
  { id: "Luma7",  seed: "Luma7" },
  { id: "Luma8",  seed: "Luma8" },
  { id: "Luma9",  seed: "Luma9" },
  { id: "Luma10", seed: "Luma10" },
  { id: "Luma11", seed: "Luma11" },
  { id: "Luma12", seed: "Luma12" },
];

export function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=fecdd3,fbcfe8,f5d0fe,ddd6fe,bfdbfe&backgroundType=gradientLinear`;
}

export default function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-gray-500">Charakter wählen</p>
      <div className="grid grid-cols-4 gap-3">
        {avatarList.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            className={`rounded-2xl aspect-square overflow-hidden border-3 transition-all ${
              selected === a.id
                ? "border-rose-400 ring-2 ring-rose-300 scale-105 shadow-md"
                : "border-gray-100 hover:border-rose-200 hover:scale-102"
            }`}
            style={{ border: selected === a.id ? "3px solid #fb7185" : "3px solid #f3f4f6" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl(a.seed)}
              alt={`Charakter ${a.id}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export { avatarList };
