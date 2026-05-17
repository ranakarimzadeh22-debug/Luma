"use client";

interface FlowerBloomProps {
  glasses: number;
  totalGlasses: number;
}

const STAGES = [
  { label: "seed",    emoji: "🌱", scale: 0.4, opacity: 0.6 },
  { label: "sprout",  emoji: "🌿", scale: 0.5, opacity: 0.7 },
  { label: "growing", emoji: "🌻", scale: 0.7, opacity: 0.85 },
  { label: "bud",     emoji: "🌷", scale: 0.85, opacity: 0.95 },
  { label: "bloom",   emoji: "🌸", scale: 1.0, opacity: 1.0 },
];

export default function FlowerBloom({ glasses, totalGlasses }: FlowerBloomProps) {
  const ratio = glasses / totalGlasses;
  const stageIndex = Math.min(
    Math.floor(ratio * STAGES.length),
    STAGES.length - 1
  );
  const stage = STAGES[Math.max(0, stageIndex)];

  return (
    <div className="flex flex-col items-center justify-center py-3 select-none">
      {/* Flower container */}
      <div
        className="relative transition-all duration-700 ease-out"
        style={{
          transform: `scale(${stage.scale})`,
          opacity: stage.opacity,
          filter: glasses === 0 ? "grayscale(0.8)" : "grayscale(0)",
        }}
      >
        {/* Main flower emoji */}
        <div className="flower-bloom text-6xl leading-none">
          {glasses === 0 ? "🌰" : stage.emoji}
        </div>

        {/* Water drops animation when progress is made */}
        {glasses > 0 && glasses < totalGlasses && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1">
            {Array.from({ length: Math.min(glasses, 3) }).map((_, i) => (
              <span
                key={i}
                className="text-xs animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1.5s",
                }}
              >
                💧
              </span>
            ))}
          </div>
        )}

        {/* Sparkle effect when goal reached */}
        {glasses >= totalGlasses && (
          <div className="absolute -inset-4 flex items-center justify-center">
            <div className="absolute w-full h-full animate-ping rounded-full" style={{ background: "radial-gradient(circle, rgba(183,153,229,0.3) 0%, transparent 70%)" }} />
          </div>
        )}
      </div>

      {/* Stage label */}
      <p
        className="text-xs mt-2 font-medium transition-all duration-500"
        style={{
          color: glasses >= totalGlasses ? "#27ae60" : "#4a6a8f",
          opacity: glasses === 0 ? 0.5 : 1,
        }}
      >
        {glasses === 0 && "🌱 Samen"}
        {glasses > 0 && glasses < totalGlasses * 0.25 && "🌱 Keimling"}
        {glasses >= totalGlasses * 0.25 && glasses < totalGlasses * 0.5 && "🌿 Sprössling"}
        {glasses >= totalGlasses * 0.5 && glasses < totalGlasses * 0.75 && "🌻 Wächst"}
        {glasses >= totalGlasses * 0.75 && glasses < totalGlasses && "🌷 Knospe"}
        {glasses >= totalGlasses && "🌸 In voller Blüte!"}
      </p>
    </div>
  );
}