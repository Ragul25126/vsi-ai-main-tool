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

/** Overview: your website connected to every part of VSI. */
export function OverviewScene({ className }: { className?: string }) {
  const nodes = [
    { x: 70, y: 62 },
    { x: 370, y: 62 },
    { x: 70, y: 238 },
    { x: 370, y: 238 },
  ];
  return (
    <Scene className={className} label="Your website in the middle, connected to site health, search results, AI answers, competitors and a list of actions">
      {nodes.map((n, i) => {
        const tx = n.x < 220 ? 160 : 280;
        const ty = n.y < 150 ? 118 : 182;
        return <path key={i} d={`M${n.x + (n.x < 220 ? 28 : -28)} ${n.y}C${(n.x + tx) / 2} ${n.y} ${(n.x + tx) / 2} ${ty} ${tx} ${ty}`} {...faint} strokeDasharray="3 5" />;
      })}
      <path d="M220 196v30" {...faint} strokeDasharray="3 5" />
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={28} {...line} fill={SURFACE} />
      ))}
      {/* Site health */}
      <path d="M70 47l12 4.5v9c0 8-5.5 13.5-12 16-6.5-2.5-12-8-12-16v-9z" {...line} />
      <Check x={70} y={62} />
      {/* Search */}
      <Magnifier x={366} y={58} />
      {/* AI answer */}
      <Bubble x={70} y={236} />
      {/* Competitors */}
      <path d="M356 228h28M356 238h18M356 248h24" {...line} strokeWidth={3} opacity={0.6} />
      {/* Your website */}
      <Browser x={160} y={104} w={120} h={92} you>
        <path d="M174 146h62" {...line} strokeWidth={3} />
        <Lines x={174} y={160} widths={[88, 70, 80]} gap={10} />
      </Browser>
      {/* Actions */}
      <rect x={180} y={226} width={80} height={52} rx={8} {...line} fill={SURFACE} />
      <rect x={192} y={237} width={11} height={11} rx={2.5} {...line} />
      <Check x={197.5} y={242.5} size={0.7} />
      <path d="M211 242.5h36" {...faint} />
      <rect x={192} y={256} width={11} height={11} rx={2.5} {...line} />
      <path d="M211 261.5h28" {...faint} />
    </Scene>
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
