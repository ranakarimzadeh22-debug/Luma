interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  emoji: string;
  bg: string;
  border: string;
}

export default function StatCard({ label, value, sub, emoji, bg, border }: StatCardProps) {
  return (
    <div className="rounded-3xl p-4" style={{ background: bg, border: `1.5px solid ${border}` }}>
      <span className="text-xl">{emoji}</span>
      <p className="text-xs mt-2" style={{ color: "#a094a8" }}>{label}</p>
      <p className="text-sm font-medium mt-0.5" style={{ color: "#3a2d3f" }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: "#cdb4db" }}>{sub}</p>}
    </div>
  );
}
