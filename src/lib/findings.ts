import type { Tone } from "@/components/ui/Status";
import type { TaskDraft, TaskSource } from "@/lib/task-payload";

/**
 * One shape for every finding VSI shows, whichever module produced it.
 * Serializable, so server pages can build findings and pass them to the UI.
 */
export interface Finding {
  key: string;
  source: TaskSource;
  sourceLabel: string;
  title: string;
  tone: Tone;
  statusText: string;
  /** 0–100, higher = more urgent. Used to rank Next Actions. */
  priority: number;
  whatWeFound: string;
  whyItMatters: string;
  whatToDo: string;
  affected: { label: string; href?: string; external?: boolean; note?: string }[];
  technical?: { label: string; value: string }[];
  /** Where to see this finding in its own module. */
  href: string;
  draft: TaskDraft | null;
}

export function toneForPriority(priority: number): Tone {
  if (priority >= 70) return "critical";
  if (priority >= 35) return "attention";
  return "info";
}
