import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Eyebrow } from "@/components/ui/Page";
import { SectionHeading } from "./FeatureIntro";

/** Shown only as an illustration of the result. Never a score, never a number. */
const EXAMPLE_ROWS: { ok: boolean; title: string; text: string }[] = [
  { ok: true, title: "Secure website", text: "Visitors and search engines see a safe connection." },
  { ok: true, title: "Mobile-friendly pages", text: "Pages fit small screens." },
  { ok: false, title: "Missing page descriptions", text: "What to do: write a short summary for each page, so search results show your own words." },
  { ok: false, title: "Broken internal link", text: "What to do: update or remove the link, so visitors don't reach a dead end." },
];

const AFTER_AUDIT = [
  { title: "What passed", text: "So you know what is already working." },
  { title: "What needs attention", text: "Each problem, and why it matters for your business." },
  { title: "What to do next", text: "A clear step for you or whoever looks after your website." },
];

/** What a result looks like. Dashed and labelled, so it can't be read as real data. */
export function ExampleAudit() {
  return (
    <section className="grid items-start gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div>
        <SectionHeading
          eyebrow="After the audit"
          title="What you'll see"
          text="A short list, not a technical report. VSI explains what each issue means and what to do next."
        />
        <dl className="mt-6 divide-y divide-line border-y border-line">
          {AFTER_AUDIT.map((a) => (
            <div key={a.title} className="grid gap-x-6 gap-y-0.5 py-3 sm:grid-cols-[11rem_minmax(0,1fr)]">
              <dt className="text-body font-medium text-ink">{a.title}</dt>
              <dd className="text-support text-ink-2">{a.text}</dd>
            </div>
          ))}
        </dl>
      </div>
      <figure className="rounded-panel border border-dashed border-line-strong bg-surface">
        <figcaption className="flex items-center justify-between gap-4 border-b border-dashed border-line-strong px-5 py-3">
          <Eyebrow>Example audit</Eyebrow>
          <span className="text-caption text-ink-3">For illustration. Not your website.</span>
        </figcaption>
        <ul className="divide-y divide-line px-5">
          {EXAMPLE_ROWS.map((r) => (
            <li key={r.title} className="flex gap-3 py-3.5">
              {r.ok ? (
                <CheckCircle2 size={18} strokeWidth={1.75} className="mt-px shrink-0 text-positive" aria-hidden />
              ) : (
                <AlertTriangle size={18} strokeWidth={1.75} className="mt-px shrink-0 text-attention" aria-hidden />
              )}
              <div className="min-w-0">
                <p className="text-body font-medium text-ink">
                  <span className="sr-only">{r.ok ? "Passed: " : "Needs attention: "}</span>
                  {r.title}
                </p>
                <p className="mt-0.5 text-support text-ink-2">{r.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </figure>
    </section>
  );
}
