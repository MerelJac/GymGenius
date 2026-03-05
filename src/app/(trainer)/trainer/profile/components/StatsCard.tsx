export function StatCard({
  label,
  value,
  color = "text-foreground",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-surface border border-surface2 rounded-2xl px-4 py-4 space-y-1">
      <p className="text-[10px] font-semibold tracking-widest uppercase text-muted">
        {label}
      </p>
      <p className={`font-syne font-extrabold text-2xl ${color}`}>
        {value}
      </p>
    </div>
  );
}