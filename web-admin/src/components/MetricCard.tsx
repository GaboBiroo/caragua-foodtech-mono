export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  badge,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  badge?: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm hover:border-slate-700 transition">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <span className="text-2xl p-2 bg-slate-800 rounded-lg">{icon}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {badge && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/30">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}
