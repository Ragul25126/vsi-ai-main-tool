/**
 * VSI concept diagrams. One visual language: 1.5px strokes in currentColor,
 * neutral fills, and at most one brand-gold mark that always means "you".
 * Used in empty states and "how this works" explanations, never as decoration
 * next to real data.
 */

import type { ReactNode } from "react";

const stroke = { stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, fill: "none" };
const fillLine = "var(--surface-2)";
const brand = "var(--brand)";

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 160 120" role="img" aria-label={label} className="h-auto w-full">
      {children}
    </svg>
  );
}

/** Site Audit: a page outline with a clear answer block. */
export function SiteDiagram() {
  return (
    <Frame label="A web page outline with a title, headings and a clear answer section">
      <rect x="20" y="12" width="120" height="96" rx="6" {...stroke} fill="var(--surface)" />
      <path d="M20 26h120" {...stroke} />
      <circle cx="28" cy="19" r="1.5" fill="currentColor" />
      <circle cx="34" cy="19" r="1.5" fill="currentColor" />
      <path d="M32 38h56" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <path d="M32 50h84M32 57h70" {...stroke} opacity={0.5} />
      <rect x="30" y="66" width="100" height="30" rx="4" fill={fillLine} stroke={brand} strokeWidth={1.5} />
      <path d="M38 75h40" stroke={brand} strokeWidth={2} strokeLinecap="round" />
      <path d="M38 83h78M38 89h60" {...stroke} opacity={0.5} />
    </Frame>
  );
}

/** GEO: an AI answer with numbered sources, your source marked. */
export function AnswerDiagram() {
  return (
    <Frame label="An AI answer followed by a list of sources, with your website marked">
      <rect x="16" y="10" width="128" height="50" rx="6" {...stroke} fill="var(--surface)" />
      <path d="M26 22h70M26 30h96M26 38h84" {...stroke} opacity={0.5} />
      <path d="M26 46h30" stroke={brand} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M60 46h40" {...stroke} opacity={0.5} />
      {[0, 1, 2].map((i) => {
        const y = 74 + i * 14;
        const you = i === 1;
        return (
          <g key={i}>
            <circle cx="24" cy={y} r="5" fill={you ? brand : fillLine} stroke={you ? brand : "currentColor"} strokeWidth={1.5} />
            <path d={`M36 ${y}h${you ? 64 : 52}`} stroke={you ? brand : "currentColor"} strokeWidth={you ? 2 : 1.5} strokeLinecap="round" opacity={you ? 1 : 0.5} />
          </g>
        );
      })}
    </Frame>
  );
}

/** Competitors: how often each business is used as a source. */
export function CompareDiagram() {
  const rows = [
    { w: 58, you: true },
    { w: 104, you: false },
    { w: 82, you: false },
  ];
  return (
    <Frame label="Bars comparing how often you and two competitors appear in AI answers">
      {rows.map((r, i) => {
        const y = 26 + i * 30;
        return (
          <g key={i}>
            <circle cx="22" cy={y} r="6" fill={r.you ? brand : fillLine} stroke={r.you ? brand : "currentColor"} strokeWidth={1.5} />
            <rect x="36" y={y - 5} width={r.w} height="10" rx="3" fill={r.you ? brand : fillLine} stroke={r.you ? brand : "currentColor"} strokeWidth={1.5} />
          </g>
        );
      })}
    </Frame>
  );
}

/** Actions: a checklist that loops back to "check again". */
export function ChecklistDiagram() {
  return (
    <Frame label="A checklist with two items done and an arrow looping back to check again">
      {[0, 1, 2].map((i) => {
        const y = 28 + i * 26;
        const done = i < 2;
        return (
          <g key={i}>
            <rect x="20" y={y - 7} width="14" height="14" rx="3" {...stroke} fill="var(--surface)" />
            {done && <path d={`M23.5 ${y}l3 3 5-6`} stroke="currentColor" strokeWidth={1.75} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
            <path d={`M44 ${y}h${done ? 60 : 72}`} {...stroke} opacity={done ? 0.4 : 0.8} />
          </g>
        );
      })}
      <path d="M128 84c14-6 14-50 0-56" stroke={brand} strokeWidth={1.75} fill="none" strokeLinecap="round" />
      <path d="M124 24l5 4-5 4" stroke={brand} strokeWidth={1.75} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}
