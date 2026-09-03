export type ChartPoint = { label: string; value: number };

const W = 640;
const H = 240;
const PAD = { top: 16, right: 20, bottom: 34, left: 42 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const TARGET = 80;

function x(i: number, count: number) {
  if (count <= 1) return PAD.left + PLOT_W / 2;
  return PAD.left + (i / (count - 1)) * PLOT_W;
}

function y(value: number) {
  return PAD.top + (1 - value / 100) * PLOT_H;
}

/**
 * Courbe des scores des dernières séries corrigées.
 * Tracée en SVG : la série est courte et le rendu doit suivre le thème.
 */
export function ScoreChart({ points }: { points: ChartPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
        Corrige une première série pour voir ta progression.
      </div>
    );
  }

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i, points.length)} ${y(p.value)}`)
    .join(" ");
  const area = `${line} L ${x(points.length - 1, points.length)} ${y(0)} L ${x(0, points.length)} ${y(0)} Z`;

  // Au-delà de 8 séries, on n'étiquette qu'un point sur deux.
  const step = points.length > 8 ? 2 : 1;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`Progression des scores sur ${points.length} série${points.length > 1 ? "s" : ""}`}
    >
      <defs>
        <linearGradient id="score-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 25, 50, 75, 100].map((tick) => (
        <g key={tick}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(tick)}
            y2={y(tick)}
            stroke="var(--border)"
            strokeDasharray="3 5"
          />
          <text
            x={PAD.left - 8}
            y={y(tick) + 4}
            textAnchor="end"
            fontSize="11"
            fill="var(--muted-foreground)"
          >
            {tick}%
          </text>
        </g>
      ))}

      <line
        x1={PAD.left}
        x2={W - PAD.right}
        y1={y(TARGET)}
        y2={y(TARGET)}
        stroke="var(--success)"
        strokeDasharray="6 4"
        strokeOpacity="0.7"
      />
      <text
        x={W - PAD.right}
        y={y(TARGET) - 6}
        textAnchor="end"
        fontSize="11"
        fill="var(--success)"
      >
        objectif 80%
      </text>

      {points.length > 1 && <path d={area} fill="url(#score-fill)" />}
      {points.length > 1 && (
        <path
          d={line}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={x(i, points.length)}
            cy={y(p.value)}
            r="3.5"
            fill="var(--background)"
            stroke="var(--chart-1)"
            strokeWidth="2.5"
          />
          {i % step === 0 && (
            <text
              x={x(i, points.length)}
              y={H - 12}
              textAnchor="middle"
              fontSize="11"
              fill="var(--muted-foreground)"
            >
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
