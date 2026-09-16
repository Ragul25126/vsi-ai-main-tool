# VSI Chart & Data Visualization Rules

> **This is a binding project rule. Follow it without exception.**

---

## What "Graphify" is NOT

`graphify-out/` is the output directory of the **Graphify code-analysis /
knowledge-graph tooling**. It is a development analysis tool — NOT a UI chart
library. Never treat it as a charting dependency.

---

## The Rule

This project does NOT use Recharts, D3, Chart.js, visx, or any other third-party
chart library in the main Next.js `src/` application.

All data visualizations use **custom inline SVG** rendered directly in TSX.

### Before creating any new chart or visualization:

1. **Search** for an existing equivalent SVG chart component.
2. **Reuse** it directly if it fits.
3. **Extend** it with new props/data if the shape is right but data differs.
4. **Only create** a new SVG visualization when genuinely nothing equivalent exists.
5. **Never** introduce Recharts or another charting dependency unless explicitly
   approved by the project owner.
6. **Never** create a duplicate chart implementation when an existing component
   can be reused or extended.

---

## Existing Chart Components (check these first)

| Component | File | Shape |
|-----------|------|-------|
| `TrajectoryChart` | [`src/features/visibility/components/TrajectoryChart.tsx`](file:///c:/Users/pc/vsi-ai-main-tool/src/features/visibility/components/TrajectoryChart.tsx) | Area line chart + time tabs (1D/7D/1M/3M/6M/1Y/ALL) + floating tooltip + dot indicators |
| `DashboardChartsGrid` | [`src/features/visibility/components/DashboardChartsGrid.tsx`](file:///c:/Users/pc/vsi-ai-main-tool/src/features/visibility/components/DashboardChartsGrid.tsx) | AI Visibility Trend area chart, Google Ranking Trend area chart, competitor horizontal bars, SERP tier progress bars |
| Inline sparkline in `DashboardClientView` | [`src/features/visibility/components/DashboardClientView.tsx#L547`](file:///c:/Users/pc/vsi-ai-main-tool/src/features/visibility/components/DashboardClientView.tsx) | Compact 200×60 sparkline embedded in a KPI card |
| Circular gauge in `WebsiteHealthHero` | [`src/features/diagnosis/components/WebsiteHealthHero.tsx`](file:///c:/Users/pc/vsi-ai-main-tool/src/features/diagnosis/components/WebsiteHealthHero.tsx) | SVG `<circle>` `stroke-dasharray` / `stroke-dashoffset` progress ring |

**`TrajectoryChart` is the canonical area-line chart.** Reuse it whenever the
visualization is a time-series line/area chart.

---

## Established SVG Visual Language

All charts share the same visual conventions:

| Element | Value |
|---------|-------|
| Active line / accent color | `#F56A3D` (same as `#FF5A1F` VSI primary) |
| Area fill | `linearGradient` from `#F56A3D` at 25% opacity → 0% |
| Grid lines | `var(--border)` with `strokeDasharray="4 4"` |
| Background / card color | `var(--card)` |
| Data-point dots | `fill-[#F56A3D] stroke-card stroke-2` |
| SVG sizing | `className="w-full h-56 sm:h-64 overflow-visible"` |
| Gradient IDs | Unique per chart (`visGrad`, `rankGrad`, `orangeGradient`, etc.) |

---

## Coordinate Mapping Formula

Copy this for any new area / line chart:

```tsx
const chartWidth  = 400;
const chartHeight = 130;
const minVal = Math.min(...points) - 5;
const maxVal = Math.max(...points) + 5;

const svgCoords = points.map((val, idx) => {
  const x = (idx / (points.length - 1)) * chartWidth;
  const y = chartHeight - ((val - minVal) / (maxVal - minVal)) * (chartHeight - 40) - 20;
  return { x, y, val };
});

const polylinePoints = svgCoords.map((c) => `${c.x},${c.y}`).join(" ");
const polygonPoints  = `0,${chartHeight} ${polylinePoints} ${chartWidth},${chartHeight}`;
```

Gradient definition:

```tsx
<defs>
  <linearGradient id="myUniqueGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stopColor="#F56A3D" stopOpacity="0.25" />
    <stop offset="70%"  stopColor="#F56A3D" stopOpacity="0.04" />
    <stop offset="100%" stopColor="#F56A3D" stopOpacity="0"    />
  </linearGradient>
</defs>
```

SVG structure:

```tsx
<svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56 sm:h-64 overflow-visible">
  <defs>…gradient…</defs>
  {/* Grid lines */}
  {[0.2, 0.5, 0.8].map((ratio, i) => (
    <line key={i} x1="0" y1={chartHeight * ratio} x2={chartWidth} y2={chartHeight * ratio}
      stroke="var(--border)" strokeDasharray="4 4" />
  ))}
  {/* Filled area */}
  <polygon points={polygonPoints} fill="url(#myUniqueGrad)" />
  {/* Line */}
  <polyline points={polylinePoints} fill="none" stroke="#F56A3D" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" />
  {/* Dots */}
  {svgCoords.map((c, i) => (
    <circle key={i} cx={c.x} cy={c.y}
      r={i === svgCoords.length - 1 ? "5" : "3"}
      className={i === svgCoords.length - 1
        ? "fill-[#F56A3D] stroke-card stroke-2"
        : "fill-card stroke-[#F56A3D] stroke-2"} />
  ))}
</svg>
```

---

## Applies To

Any of the following — use the custom SVG approach:

- Line or area charts
- Bar or column charts (horizontal or vertical)
- Donut / pie charts
- Radial gauges or circular progress rings
- KPI card sparklines
- Heatmaps or grid-based visualizations
- Any animated SVG data visualization

