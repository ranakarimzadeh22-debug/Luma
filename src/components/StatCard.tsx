interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  emoji: string;
  bg: string;
}

export default function StatCard({ label, value, sub, emoji, bg }: StatCardProps) {
  return (
    <div className={`rounded-3xl p-4 ${bg}`}>
      <span className="text-xl">{emoji}</span>
      <p className="text-xs text-gray-400 mt-2">{label}</p>
      <p className="text-base font-medium text-gray-800 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-300 mt-0.5">{sub}</p>}
    </div>
  );
}
