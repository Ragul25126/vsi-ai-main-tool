/**
 * VSI feature illustrations. One visual language for every scene:
 * 1.5px strokes in currentColor, neutral fills, at most one gold mark that
 * always means "you / your website", and at most one attention mark that
 * means "an issue". No numbers, names or readable text, so a drawing can
 * never be mistaken for real data. Used only on first-use and setup screens.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const line = { stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
const faint = { ...line, opacity: 0.45 };
const SURFACE = "var(--surface)";
const FILL = "var(--surface-2)";
const BRAND = "var(--brand)";
const BRAND_SOFT = "var(--brand-soft)";
const ATTENTION = "var(--attention)";
const ATTENTION_SOFT = "var(--attention-soft)";

function Scene({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 440 300" role="img" aria-label={label} className={cn("h-auto w-full", className)}>
      {children}
    </svg>
  );
}

/** Grey "text" lines. */
function Lines({ x, y, widths, gap = 12 }: { x: number; y: number; widths: number[]; gap?: number }) {
  return (
    <>
      {widths.map((w, i) => (
        <path key={i} d={`M${x} ${y + i * gap}h${w}`} {...faint} />
      ))}
    </>
  );
}

function Browser({ x, y, w, h, children, you = false }: { x: number; y: number; w: number; h: number; children?: ReactNode; you?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} {...line} fill={SURFACE} />
      <path d={`M${x} ${y + 24}h${w}`} {...line} />
      <circle cx={x + 14} cy={y + 12} r={2.5} fill="currentColor" opacity={0.5} />
      <circle cx={x + 24} cy={y + 12} r={2.5} fill="currentColor" opacity={0.5} />
      <rect x={x + 40} y={y + 7} width={Math.min(w - 60, 150)} height={10} rx={5} fill={FILL} />
      {you && <path d={`M${x + 48} ${y + 12}h${Math.min(w - 90, 60)}`} stroke={BRAND} strokeWidth={2.5} strokeLinecap="round" />}
      {children}
    </g>
  );
}

function Check({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return <path d={`M${x - 5 * size} ${y}l${3.5 * size} ${3.5 * size} ${6.5 * size} -${7.5 * size}`} {...line} strokeWidth={1.75} />;
}

function Magnifier({ x, y, r = 9 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} {...line} />
      <path d={`M${x + r * 0.72} ${y + r * 0.72}l${r * 0.8} ${r * 0.8}`} {...line} strokeWidth={2} />
    </g>
  );
}

function Bubble({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 12} ${y - 9}h24a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4h-14l-6 5v-5h-4a4 4 0 0 1-4-4v-10a4 4 0 0 1 4-4z`} {...line} />
      <path d={`M${x - 7} ${y - 2}h14M${x - 7} ${y + 4}h9`} {...faint} />
    </g>
  );
}

/**
 * Overview: VSI at work. Your website is scanned, the signal travels into
 * VSI, the four checks fill in one by one, and an action gets ticked off.
 * One slow loop (styles under "Overview scene" in globals.css); with reduced
 * motion it rests in its finished state.
 */
export function OverviewScene({ className }: { className?: string }) {
  const rows = [92, 130, 168, 206];
  return (
    <svg
      viewBox="0 0 480 340"
      role="img"
      aria-label="Your website is scanned, then site health, search results, AI answers and competitors are checked one after another, and an action is ticked off"
      className={cn("h-auto w-full", className)}
    >
      {/* Your website */}
      <Browser x={16} y={84} w={176} h={160} you>
        <path d="M32 130h70" {...line} strokeWidth={3} />
        <Lines x={32} y={146} widths={[120, 96, 110]} gap={11} />
        <rect x={32} y={184} width={144} height={46} rx={6} fill={FILL} />
        <path d="M44 222l22-22 16 14 12-9 30 17" {...faint} />
        <circle cx={156} cy={198} r={4.5} {...faint} />
        <g className="vsi-loop-scan">
          <rect x={17} y={108} width={174} height={16} fill={BRAND} opacity={0.12} />
          <path d="M8 124h192" stroke={BRAND} strokeWidth={1.75} strokeLinecap="round" />
          <circle cx={8} cy={124} r={3} fill={BRAND} />
          <circle cx={200} cy={124} r={3} fill={BRAND} />
        </g>
      </Browser>

      {/* The signal into VSI */}
      <path d="M192 164h56" {...faint} strokeDasharray="3 5" />
      <circle cx={192} cy={164} r={3.5} fill={BRAND} className="vsi-loop-dot" />

      {/* VSI */}
      <rect x={248} y={28} width={216} height={212} rx={10} {...line} fill={SURFACE} />
      <rect x={264} y={41} width={15} height={15} rx={4} fill={BRAND_SOFT} stroke={BRAND} strokeWidth={1.5} />
      <path d="M288 48.5h64" {...line} opacity={0.7} />
      <path d="M248 68h216" {...line} opacity={0.3} />
      {/* Site health, search, AI answers, competitors */}
      <path d="M272 83l7 2.6v5.2c0 4.6-3.2 7.8-7 9.2-3.8-1.4-7-4.6-7-9.2v-5.2z" {...line} />
      <Magnifier x={271} y={129} r={5.5} />
      <path d="M264 160h16a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-9l-4 3.5v-3.5h-3a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3z" {...line} />
      <path d="M264 200h16M264 206h10M264 212h13" {...line} strokeWidth={2.25} opacity={0.75} />
      {rows.map((y, i) => {
        const issue = i === 3;
        return (
          <g key={y} className={`vsi-loop-row vsi-loop-row-${i + 1}`}>
            <path d={`M296 ${y - 3}h${[84, 72, 90, 66][i]}`} {...line} opacity={0.65} />
            <path d={`M296 ${y + 6}h${[52, 60, 48, 56][i]}`} {...faint} />
            {issue ? (
              <>
                <circle cx={440} cy={y} r={9} fill={ATTENTION_SOFT} stroke={ATTENTION} strokeWidth={1.5} />
                <path d={`M440 ${y - 4.5}v5`} stroke={ATTENTION} strokeWidth={1.75} strokeLinecap="round" />
                <circle cx={440} cy={y + 4} r={1} fill={ATTENTION} />
              </>
            ) : (
              <>
                <circle cx={440} cy={y} r={9} {...line} fill={SURFACE} />
                <Check x={440} y={y} size={0.8} />
              </>
            )}
          </g>
        );
      })}

      {/* What to do next */}
      <path d="M356 240v22" {...faint} strokeDasharray="3 5" />
      <rect x={276} y={262} width={160} height={64} rx={8} {...line} fill={SURFACE} />
      <rect x={290} y={276} width={12} height={12} rx={3} {...line} />
      <path d="M312 282h96" {...faint} />
      <rect x={290} y={300} width={12} height={12} rx={3} {...line} />
      <path d="M312 306h76" {...faint} />
      <g className="vsi-loop-row vsi-loop-done">
        <rect x={290} y={276} width={12} height={12} rx={3} fill={BRAND_SOFT} stroke={BRAND} strokeWidth={1.5} />
        <path d="M292.8 282l2.6 2.6 4.4-5.2" stroke={BRAND} strokeWidth={1.75} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/** Site Audit: a website being checked, one issue found. */
export function SiteAuditScene({ className }: { className?: string }) {
  const rows = [86, 122, 158, 194, 230];
  return (
    <Scene className={className} label="A website with its pages being checked: most rows pass and one is marked as an issue">
      <Browser x={36} y={28} w={300} h={240} you>
        {rows.map((y, i) => {
          const issue = i === 2;
          return (
            <g key={y}>
              {issue ? (
                <>
                  <rect x={50} y={y - 14} width={272} height={28} rx={6} fill={ATTENTION_SOFT} />
                  <circle cx={66} cy={y} r={8} fill={SURFACE} stroke={ATTENTION} strokeWidth={1.5} />
                  <path d={`M66 ${y - 4}v4.5`} stroke={ATTENTION} strokeWidth={1.75} strokeLinecap="round" />
                  <circle cx={66} cy={y + 3.8} r={1} fill={ATTENTION} />
                </>
              ) : (
                <>
                  <circle cx={66} cy={y} r={8} {...line} fill={SURFACE} />
                  <Check x={66} y={y} size={0.75} />
                </>
              )}
              <path d={`M84 ${y - 3}h${[120, 150, 110, 136, 98][i]}`} {...line} opacity={issue ? 0.9 : 0.6} />
              <path d={`M84 ${y + 5}h${[80, 96, 128, 70, 88][i]}`} {...faint} />
            </g>
          );
        })}
      </Browser>
      <circle cx={352} cy={206} r={40} {...line} strokeWidth={2} fill={SURFACE} />
      <path d="M381 235l24 24" stroke="currentColor" strokeWidth={7} strokeLinecap="round" />
      <path d="M334 200h36M334 212h24" {...faint} />
    </Scene>
  );
}

/**
 * Site Audit first-use hero: your website is scanned, one issue is spotted,
 * and everything lands in a plain report. The scan line and the report each
 * move once on load, then stay still.
 */
export function AuditFlowScene({ className }: { className?: string }) {
  const rows = [206, 236, 266, 296];
  return (
    <svg
      viewBox="0 0 480 340"
      role="img"
      aria-label="Your website being scanned on desktop and mobile. One issue is spotted and added to a report where most checks pass."
      className={cn("h-auto w-full", className)}
    >
      <Browser x={20} y={24} w={300} h={232} you>
        {/* The scan: gold, because it is VSI reading your website. */}
        <g className="animate-scan-settle">
          <rect x={21} y={124} width={298} height={28} fill={BRAND_SOFT} opacity={0.8} />
          <path d="M10 152h320" stroke={BRAND} strokeWidth={1.75} strokeLinecap="round" />
          <circle cx={10} cy={152} r={3} fill={BRAND} />
          <circle cx={330} cy={152} r={3} fill={BRAND} />
        </g>
        {/* Already checked */}
        <path d="M40 72h92" {...line} strokeWidth={3} />
        <Lines x={40} y={90} widths={[140, 118, 130]} />
        <rect x={40} y={128} width={54} height={14} rx={4} {...line} opacity={0.6} />
        <rect x={204} y={62} width={96} height={58} rx={6} fill={FILL} />
        <path d="M212 112l20-22 15 14 11-9 24 17" {...faint} />
        <circle cx={280} cy={78} r={4.5} {...faint} />
        {/* Still to check */}
        <g opacity={0.4}>
          <rect x={116} y={170} width={72} height={50} rx={6} {...line} />
          <path d="M126 186h40M126 198h52" {...line} />
          <rect x={200} y={170} width={72} height={50} rx={6} {...line} />
          <path d="M210 186h40M210 198h30" {...line} />
          <path d="M116 236h150M116 246h110" {...line} />
        </g>
      </Browser>

      {/* The same website on a phone */}
      <rect x={36} y={178} width={66} height={118} rx={11} {...line} fill={SURFACE} />
      <path d="M60 188h18" {...faint} />
      <rect x={46} y={198} width={46} height={26} rx={4} fill={FILL} />
      <Lines x={46} y={236} widths={[46, 34]} gap={10} />
      <circle cx={69} cy={272} r={9} {...line} />
      <Check x={69} y={272} size={0.8} />

      {/* The issue, and where it goes */}
      <g className="animate-fade-in [animation-delay:1500ms] [animation-fill-mode:both]">
        <path d="M309 62C350 62 380 84 380 116" stroke={ATTENTION} strokeWidth={1.5} strokeLinecap="round" strokeDasharray="3 4" fill="none" />
        <path d="M374.5 110.5l5.5 7 5.5-7" stroke={ATTENTION} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      <circle cx={300} cy={62} r={9} fill={SURFACE} stroke={ATTENTION} strokeWidth={1.5} />
      <path d="M300 57.5v5" stroke={ATTENTION} strokeWidth={1.75} strokeLinecap="round" />
      <circle cx={300} cy={66.2} r={1} fill={ATTENTION} />

      {/* The report */}
      <g className="animate-rise-in [animation-delay:900ms]">
        <rect x={286} y={120} width={174} height={200} rx={10} {...line} fill={SURFACE} />
        <path d="M310 134l10 3.8v7.5c0 6.7-4.6 11.2-10 13.3-5.4-2.1-10-6.6-10-13.3v-7.5z" {...line} />
        <Check x={310} y={146.5} size={0.7} />
        <path d="M330 141h74" {...line} opacity={0.7} />
        <path d="M330 152h46" {...faint} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={302 + i * 37.5} y={170} width={32} height={6} rx={3} fill={i === 2 ? ATTENTION : "currentColor"} opacity={i === 2 ? 1 : 0.5} />
        ))}
        {rows.map((y, i) => {
          const issue = i === 2;
          return (
            <g key={y}>
              {issue ? (
                <>
                  <rect x={296} y={y - 14} width={154} height={28} rx={6} fill={ATTENTION_SOFT} />
                  <circle cx={312} cy={y} r={8} fill={SURFACE} stroke={ATTENTION} strokeWidth={1.5} />
                  <path d={`M312 ${y - 4}v4.5`} stroke={ATTENTION} strokeWidth={1.75} strokeLinecap="round" />
                  <circle cx={312} cy={y + 3.8} r={1} fill={ATTENTION} />
                </>
              ) : (
                <>
                  <circle cx={312} cy={y} r={8} {...line} fill={SURFACE} />
                  <Check x={312} y={y} size={0.75} />
                </>
              )}
              <path d={`M330 ${y - 3}h${[96, 84, 104, 78][i]}`} {...line} opacity={issue ? 0.9 : 0.6} />
              <path d={`M330 ${y + 5}h${[64, 70, 80, 56][i]}`} {...faint} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** Small companion drawings for the four audit areas. Same strokes and rules as the scenes. */
export function AuditAreaArt({ area, className }: { area: "health" | "search" | "ai" | "content"; className?: string }) {
  return (
    <svg viewBox="0 0 160 116" aria-hidden className={cn("h-auto w-full", className)}>
      {area === "health" && (
        <>
          <rect x={10} y={12} width={118} height={92} rx={8} {...line} fill={SURFACE} />
          <path d="M10 30h118" {...line} />
          <circle cx={21} cy={21} r={2} fill="currentColor" opacity={0.5} />
          <circle cx={29} cy={21} r={2} fill="currentColor" opacity={0.5} />
          <path d="M24 46h44" {...line} strokeWidth={2.5} />
          <Lines x={24} y={60} widths={[70, 56, 64]} gap={11} />
          <circle cx={120} cy={78} r={24} fill={SURFACE} stroke={BRAND} strokeWidth={1.5} />
          <path d="M120 62l12 4.5v8.5c0 8-5.5 13-12 15.5-6.5-2.5-12-7.5-12-15.5v-8.5z" fill={BRAND_SOFT} stroke={BRAND} strokeWidth={1.5} strokeLinejoin="round" />
          <path d="M114.5 77l4 4 7.5-8.5" stroke={BRAND} strokeWidth={1.75} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {area === "search" && (
        <>
          <rect x={10} y={10} width={112} height={22} rx={6} {...line} fill={SURFACE} />
          <path d="M22 21h52" {...faint} />
          {[48, 72, 96].map((y, i) => (
            <g key={y}>
              {i === 0 && <rect x={10} y={y - 11} width={112} height={22} rx={5} fill={BRAND_SOFT} />}
              {i === 0 && <path d={`M13 ${y - 6}v12`} stroke={BRAND} strokeWidth={2.5} strokeLinecap="round" />}
              <path d={`M22 ${y - 3}h${[58, 48, 64][i]}`} stroke={i === 0 ? BRAND : "currentColor"} strokeWidth={i === 0 ? 2.25 : 1.75} strokeLinecap="round" opacity={i === 0 ? 1 : 0.65} />
              <path d={`M22 ${y + 5}h${[84, 76, 70][i]}`} {...faint} />
            </g>
          ))}
          <circle cx={128} cy={34} r={17} {...line} fill={SURFACE} />
          <path d="M140.5 46.5l10 10" {...line} strokeWidth={3} />
          <path d="M120 34h16M120 40h10" {...faint} />
        </>
      )}
      {area === "ai" && (
        <>
          <rect x={10} y={10} width={126} height={66} rx={8} {...line} fill={SURFACE} />
          <circle cx={24} cy={24} r={5} {...line} fill={FILL} />
          <path d="M35 24h40" {...line} opacity={0.6} />
          <path d="M22 40h100" {...faint} />
          <rect x={20} y={46} width={62} height={12} rx={3} fill={BRAND_SOFT} />
          <path d="M24 52h54" stroke={BRAND} strokeWidth={2.25} strokeLinecap="round" />
          <path d="M88 52h34M22 64h78" {...faint} />
          <path d="M82 58C110 70 122 78 104 92" stroke={BRAND} strokeWidth={1.25} fill="none" strokeDasharray="2.5 3.5" strokeLinecap="round" />
          <rect x={20} y={86} width={84} height={18} rx={5} fill={BRAND_SOFT} stroke={BRAND} strokeWidth={1.5} />
          <circle cx={31} cy={95} r={3.5} fill={BRAND} />
          <path d="M40 95h52" stroke={BRAND} strokeWidth={2} strokeLinecap="round" />
          <rect x={110} y={86} width={40} height={18} rx={5} {...line} opacity={0.5} />
        </>
      )}
      {area === "content" && (
        <>
          <rect x={14} y={8} width={104} height={100} rx={8} {...line} fill={SURFACE} />
          <path d="M28 26h46" stroke={BRAND} strokeWidth={2.75} strokeLinecap="round" />
          <Lines x={28} y={40} widths={[76, 64]} gap={10} />
          <path d="M28 66h34" {...line} strokeWidth={2.25} />
          <Lines x={28} y={78} widths={[52, 44, 50]} gap={9} />
          <rect x={92} y={56} width={56} height={44} rx={6} {...line} fill={SURFACE} />
          <path d="M98 92l12-14 9 9 7-6 16 11" {...faint} />
          <circle cx={136} cy={68} r={3.5} {...faint} />
        </>
      )}
    </svg>
  );
}

/** Search Visibility: a results page with your result moving up. */
export function SearchScene({ className }: { className?: string }) {
  const rows = [92, 146, 200, 254];
  return (
    <Scene className={className} label="A search results page with your result highlighted and an arrow showing it moving up">
      <rect x={36} y={24} width={300} height={36} rx={8} {...line} fill={SURFACE} />
      <Magnifier x={56} y={41} r={7} />
      <path d="M74 42h120" {...faint} />
      {rows.map((y, i) => {
        const you = i === 1;
        return (
          <g key={y}>
            {you && <rect x={36} y={y - 20} width={300} height={46} rx={8} fill={BRAND_SOFT} />}
            {you && <path d={`M40 ${y - 12}v30`} stroke={BRAND} strokeWidth={3} strokeLinecap="round" />}
            <path d={`M52 ${y - 8}h${[72, 60, 84, 66][i]}`} {...faint} />
            <path d={`M52 ${y + 4}h${[170, 190, 150, 176][i]}`} stroke={you ? BRAND : "currentColor"} strokeWidth={you ? 2.5 : 2} strokeLinecap="round" opacity={you ? 1 : 0.7} />
            <path d={`M52 ${y + 16}h${[220, 200, 230, 180][i]}`} {...faint} />
          </g>
        );
      })}
      <path d="M378 196v-64" stroke={BRAND} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M366 144l12-13 12 13" stroke={BRAND} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M366 214h24" {...faint} strokeDasharray="3 4" />
    </Scene>
  );
}

/** AI Visibility: an AI answer that mentions you and cites your website. */
export function AnswerScene({ className }: { className?: string }) {
  return (
    <Scene className={className} label="An AI answer that mentions your business, with your website listed among its sources">
      <rect x={36} y={20} width={368} height={148} rx={10} {...line} fill={SURFACE} />
      <circle cx={60} cy={44} r={9} {...line} fill={FILL} />
      <path d="M76 44h90" {...line} opacity={0.6} />
      <Lines x={56} y={74} widths={[300, 270]} gap={14} />
      <rect x={52} y={95} width={118} height={16} rx={4} fill={BRAND_SOFT} />
      <path d="M58 103h106" stroke={BRAND} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M180 103h160" {...faint} />
      <Lines x={56} y={126} widths={[290, 220]} gap={14} />
      {[196, 230, 264].map((y, i) => {
        const you = i === 1;
        return (
          <g key={y}>
            <rect x={52} y={y - 13} width={250} height={26} rx={6} fill={you ? BRAND_SOFT : "none"} stroke={you ? BRAND : "currentColor"} strokeWidth={1.5} opacity={you ? 1 : 0.55} />
            <circle cx={68} cy={y} r={5} fill={you ? BRAND : FILL} stroke={you ? BRAND : "currentColor"} strokeWidth={1.5} />
            <path d={`M82 ${y}h${you ? 120 : [100, 0, 140][i]}`} stroke={you ? BRAND : "currentColor"} strokeWidth={you ? 2.5 : 1.5} strokeLinecap="round" opacity={you ? 1 : 0.5} />
          </g>
        );
      })}
      <path d="M170 111C250 150 340 170 302 230" stroke={BRAND} strokeWidth={1.5} fill="none" strokeDasharray="3 4" strokeLinecap="round" />
    </Scene>
  );
}

/** Competitors: you and two competitors compared in search and AI answers. */
export function CompareScene({ className }: { className?: string }) {
  const rows = [
    { y: 102, you: true, s: 60, a: 44 },
    { y: 172, you: false, s: 92, a: 80 },
    { y: 242, you: false, s: 74, a: 96 },
  ];
  return (
    <Scene className={className} label="Your business and two competitors compared side by side in search results and in AI answers">
      <Magnifier x={226} y={42} r={8} />
      <Bubble x={344} y={42} />
      <path d="M36 70h368" {...faint} />
      {rows.map((r) => (
        <g key={r.y}>
          {r.you && <rect x={36} y={r.y - 26} width={368} height={52} rx={8} fill={BRAND_SOFT} />}
          <circle cx={62} cy={r.y} r={13} fill={r.you ? BRAND : FILL} stroke={r.you ? BRAND : "currentColor"} strokeWidth={1.5} />
          <path d={`M86 ${r.y - 5}h${r.you ? 70 : 84}`} stroke={r.you ? BRAND : "currentColor"} strokeWidth={2.5} strokeLinecap="round" opacity={r.you ? 1 : 0.7} />
          <path d={`M86 ${r.y + 7}h48`} {...faint} />
          <rect x={190} y={r.y - 5} width={r.s} height={10} rx={3} fill={r.you ? BRAND : FILL} stroke={r.you ? BRAND : "currentColor"} strokeWidth={1.5} />
          <rect x={304} y={r.y - 5} width={r.a} height={10} rx={3} fill={r.you ? BRAND : FILL} stroke={r.you ? BRAND : "currentColor"} strokeWidth={1.5} />
          {!r.you && <path d={`M36 ${r.y + 35}h368`} {...faint} opacity={0.25} />}
        </g>
      ))}
    </Scene>
  );
}

/** Next Actions: a finding becomes a task, and the task is checked again. */
export function ActionsScene({ className }: { className?: string }) {
  return (
    <Scene className={className} label="A finding turns into a task, and the finished task is checked again">
      <rect x={24} y={86} width={120} height={128} rx={10} {...line} fill={SURFACE} />
      <circle cx={48} cy={112} r={9} fill={ATTENTION_SOFT} stroke={ATTENTION} strokeWidth={1.5} />
      <path d="M48 107.5v5" stroke={ATTENTION} strokeWidth={1.75} strokeLinecap="round" />
      <circle cx={48} cy={116} r={1} fill={ATTENTION} />
      <path d="M66 112h56" {...line} opacity={0.7} />
      <Lines x={40} y={140} widths={[86, 74, 80, 52]} gap={14} />
      <path d="M154 150h26" {...line} />
      <path d="M174 144l6 6-6 6" {...line} />
      <rect x={190} y={86} width={120} height={128} rx={10} {...line} fill={SURFACE} />
      {[116, 146, 176].map((y, i) => (
        <g key={y}>
          <rect x={206} y={y - 7} width={14} height={14} rx={3} {...line} />
          {i === 0 && <Check x={213} y={y} size={0.8} />}
          <path d={`M230 ${y}h${[62, 54, 66][i]}`} {...faint} />
        </g>
      ))}
      <path d="M320 150h26" {...line} />
      <path d="M340 144l6 6-6 6" {...line} />
      <circle cx={386} cy={150} r={32} {...line} fill={SURFACE} />
      <Check x={386} y={150} size={1.6} />
      <path d="M386 104c-26 0-44 12-44 12" {...faint} strokeDasharray="3 4" />
      <path d="M252 76C300 34 380 40 386 112" {...faint} strokeDasharray="3 4" />
    </Scene>
  );
}

/** Tasks: a simple board with work moving to done. */
export function BoardScene({ className }: { className?: string }) {
  const cols = [
    { x: 24, cards: 3, done: false },
    { x: 162, cards: 2, done: false },
    { x: 300, cards: 2, done: true },
  ];
  return (
    <Scene className={className} label="A task board with three columns: to do, in progress and done">
      {cols.map((c) => (
        <g key={c.x}>
          <rect x={c.x} y={24} width={116} height={252} rx={10} fill={SURFACE} stroke="currentColor" strokeWidth={1.5} opacity={0.35} />
          <path d={`M${c.x + 14} 46h52`} {...line} opacity={0.7} />
          {Array.from({ length: c.cards }).map((_, i) => {
            const y = 66 + i * 66;
            return (
              <g key={i}>
                <rect x={c.x + 10} y={y} width={96} height={54} rx={7} {...line} fill={SURFACE} />
                {c.done ? (
                  <>
                    <circle cx={c.x + 26} cy={y + 18} r={7} {...line} />
                    <Check x={c.x + 26} y={y + 18} size={0.65} />
                  </>
                ) : (
                  <rect x={c.x + 19} y={y + 11} width={14} height={14} rx={3} {...line} />
                )}
                <path d={`M${c.x + 42} ${y + 18}h${[48, 40, 52][i % 3]}`} {...line} opacity={0.6} />
                <path d={`M${c.x + 20} ${y + 38}h${[70, 58, 64][i % 3]}`} {...faint} />
              </g>
            );
          })}
        </g>
      ))}
    </Scene>
  );
}

/** Reports: one document that brings progress together. */
export function ReportScene({ className }: { className?: string }) {
  return (
    <Scene className={className} label="A report page with a heading, a progress line going up and a list of completed work">
      <rect x={104} y={14} width={232} height={272} rx={10} {...line} fill={SURFACE} />
      <path d="M128 42h96" {...line} strokeWidth={3} />
      <path d="M128 56h60" {...faint} />
      <rect x={128} y={76} width={184} height={96} rx={6} fill={FILL} />
      <path d="M138 156h164M138 124h164M138 92h164" {...faint} opacity={0.25} />
      <path d="M140 150l32-12 30 8 34-26 30 4 26-30" stroke={BRAND} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={292} cy={94} r={3.5} fill={BRAND} />
      {[198, 226, 254].map((y, i) => (
        <g key={y}>
          <circle cx={136} cy={y} r={7} {...line} />
          {i < 2 && <Check x={136} y={y} size={0.65} />}
          <path d={`M152 ${y}h${[120, 96, 136][i]}`} {...faint} />
        </g>
      ))}
    </Scene>
  );
}

/** AI Chat: a question about your website and an answer that shows its sources. */
export function ChatScene({ className }: { className?: string }) {
  return (
    <Scene className={className} label="A question about your website and an answer with its sources listed underneath">
      <rect x={176} y={24} width={228} height={50} rx={12} {...line} fill={SURFACE} />
      <Magnifier x={200} y={48} r={7} />
      <path d="M218 44h150M218 56h110" {...line} opacity={0.6} />
      <rect x={36} y={96} width={300} height={130} rx={12} {...line} fill={SURFACE} />
      <circle cx={60} cy={120} r={9} {...line} fill={FILL} />
      <Lines x={78} y={120} widths={[200]} />
      <Lines x={56} y={146} widths={[256, 236]} gap={14} />
      <rect x={52} y={167} width={110} height={16} rx={4} fill={BRAND_SOFT} />
      <path d="M58 175h98" stroke={BRAND} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M170 175h120" {...faint} />
      <Lines x={56} y={202} widths={[200]} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={36 + i * 96} y={244} width={86} height={26} rx={6} fill="none" stroke={i === 0 ? BRAND : "currentColor"} strokeWidth={1.5} opacity={i === 0 ? 1 : 0.5} />
      ))}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${50 + i * 96} 257h${i === 0 ? 56 : 48}`} stroke={i === 0 ? BRAND : "currentColor"} strokeWidth={1.5} strokeLinecap="round" opacity={i === 0 ? 1 : 0.45} />
      ))}
    </Scene>
  );
}
