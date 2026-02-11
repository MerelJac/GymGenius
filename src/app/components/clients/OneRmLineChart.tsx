import { OneRMPoint } from "@/types/exercise";

function normalizeByDay(data: OneRMPoint[]): OneRMPoint[] {
  const byDay = new Map<string, number>();

  for (const point of data) {
    if (!point.value || point.value <= 0) continue;

    const existing = byDay.get(point.date);
    if (existing == null || point.value > existing) {
      byDay.set(point.date, point.value);
    }
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

export function OneRMLineChart({ data }: { data: OneRMPoint[] }) {
  const normalized = normalizeByDay(data);

  if (normalized.length < 2) {
    return (
      <p className="text-sm text-gray-500">
        Not enough data to show progress
      </p>
    );
  }

  const padding = { top: 8, right: 8, bottom: 20, left: 28 };

  const values = normalized.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const yTicks = [
    Math.round(min),
    Math.round(min + range / 2),
    Math.round(max),
  ];

  const points = normalized
    .map((d, i) => {
      const x =
        padding.left +
        (i / (normalized.length - 1)) *
          (100 - padding.left - padding.right);

      const y =
        padding.top +
        (1 - (d.value - min) / range) *
          (100 - padding.top - padding.bottom);

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="w-full h-36">
      {/* Grid lines + Y labels */}
      {yTicks.map((tick, i) => {
        const y =
          padding.top +
          (1 - (tick - min) / range) *
            (100 - padding.top - padding.bottom);

        return (
          <g key={i}>
            <line
              x1={padding.left}
              x2={100 - padding.right}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeDasharray="2 2"
            />
            <text
              x={padding.left - 2}
              y={y + 2}
              textAnchor="end"
              fontSize="3"
              fill="#6b7280"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {/* X-axis labels */}
      <text
        x={padding.left}
        y={100 - 6}
        fontSize="3"
        fill="#6b7280"
        textAnchor="start"
      >
        {normalized[0].date}
      </text>

      <text
        x={100 - padding.right}
        y={100 - 6}
        fontSize="3"
        fill="#6b7280"
        textAnchor="end"
      >
        {normalized[normalized.length - 1].date}
      </text>

      {/* Data line */}
      <polyline
        fill="none"
        stroke="#111827"
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
}
