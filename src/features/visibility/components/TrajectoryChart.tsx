/**
 * TrendLine: a small, honest line chart in plain SVG.
 * It only draws the points it is given. With fewer than two points it
 * renders nothing and the caller shows a "trend appears after..." note.
 * (Formerly TrajectoryChart, which synthesised history from one value.)
 */

export interface TrendPoint {
  /** Short label for the x position, e.g. "12 Sep". */
  label: string;
  value: number;
}

interface TrendLineProps {
  points: TrendPoint[];
  /** Upper bound of the y axis. Defaults to 100 (scores and percentages). */
  max?: number;
  /** Lower values are better (e.g. search position). Flips the y axis. */
  invert?: boolean;
  format?: (v: number) => string;
  ariaLabel: string;
  tone?: "you" | "neutral";
  className?: string;
}

const W = 320;
const H = 96;
const PAD_X = 8;
const PAD_Y = 12;

export function TrendLine({ points, max = 100, invert = false, format = (v) => String(v), ariaLabel, tone = "you", className }: TrendLineProps) {
  if (points.length < 2) return null;

  const values = points.map((p) => p.value);
  const top = invert ? Math.max(...values, 1) : max;
  const bottom = invert ? Math.min(...values, 1) : 0;
  const span = top - bottom || 1;

  const coords = points.map((p, i) => {
    const x = PAD_X + (i / (points.length - 1)) * (W - PAD_X * 2);
    const ratio = (p.value - bottom) / span;
    const y = invert ? PAD_Y + ratio * (H - PAD_Y * 2) : H - PAD_Y - ratio * (H - PAD_Y * 2);
    return { x, y, ...p };
  });
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const color = tone === "you" ? "var(--brand)" : "var(--ink-3)";
  const last = coords[coords.length - 1];

  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" role="img" aria-label={ariaLabel}>
        <line x1={PAD_X} x2={W - PAD_X} y1={H - PAD_Y} y2={H - PAD_Y} stroke="var(--line)" strokeWidth={1} />
        <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 3.5 : 2.5} fill="var(--surface)" stroke={color} strokeWidth={1.75}>
            <title>{`${c.label}: ${format(c.value)}`}</title>
          </circle>
        ))}
      </svg>
      <figcaption className="mt-1 flex justify-between text-caption text-ink-3">
        <span>{coords[0].label}</span>
        <span>
          {last.label}: <span className="font-medium tabular text-ink-2">{format(last.value)}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export default TrendLine;
