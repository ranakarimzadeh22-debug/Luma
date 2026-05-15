"use client";

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatar: string) => void;
}

const avatars = [
  { id: "fox",        emoji: "🦊", name: "Fuchs" },
  { id: "cat",        emoji: "🐱", name: "Katze" },
  { id: "bunny",      emoji: "🐰", name: "Hase" },
  { id: "bear",       emoji: "🐻", name: "Bär" },
  { id: "panda",      emoji: "🐼", name: "Panda" },
  { id: "koala",      emoji: "🐨", name: "Koala" },
  { id: "frog",       emoji: "🐸", name: "Frosch" },
  { id: "penguin",    emoji: "🐧", name: "Pinguin" },
  { id: "unicorn",    emoji: "🦄", name: "Einhorn" },
  { id: "butterfly",  emoji: "🦋", name: "Schmetterling" },
  { id: "flower",     emoji: "🌸", name: "Blume" },
  { id: "star",       emoji: "⭐", name: "Stern" },
];

export default function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-gray-500">Charakter wählen</p>
      <div className="grid grid-cols-6 gap-2">
        {avatars.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            title={a.name}
            className={`flex flex-col items-center justify-center rounded-2xl aspect-square text-2xl transition-all border-2 ${
              selected === a.id
                ? "border-rose-400 bg-rose-50 scale-110 shadow-md"
                : "border-gray-100 bg-gray-50 hover:border-rose-200 hover:scale-105"
            }`}
          >
            {a.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

export { avatars };
