interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  emoji: string;
  bg: string;
}

export default function StatCard({ label, value, sub, emoji, bg }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-4 ${bg} flex flex-col gap-1`}>
      <span className="text-2xl">{emoji}</span>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}
