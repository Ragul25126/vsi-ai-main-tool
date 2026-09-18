"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Phase =
  | { kind: "idle" }
  | { kind: "confirm" }
  | { kind: "running" }
  | { kind: "done"; message: string; tone: "positive" | "attention" }
  | { kind: "error"; message: string };

/**
 * Runs the project's search checks (Google ranking, AI answers, ChatGPT)
 * through the existing pipeline. Asks first, because checks use API credits.
 */
export function RunChecksButton({
  clientId,
  searches,
  label = "Run AI check",
}: {
  clientId: string;
  searches: number;
  label?: string;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });

  async function run() {
    setPhase({ kind: "running" });
    try {
      const res = await fetch("/api/run-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });
      if (!res.ok) {
        setPhase({
          kind: "error",
          message: res.status === 404 ? "This project isn't available to your account." : "The check couldn't run. Please try again.",
        });
        return;
      }
      const result = (await res.json()) as { total: number; completed: number; failed: number };
      router.refresh();
      if (result.total === 0) {
        setPhase({ kind: "done", tone: "attention", message: "There are no active searches to check yet." });
      } else if (result.failed > 0) {
        setPhase({
          kind: "done",
          tone: "attention",
          message: `Checked ${result.completed} of ${result.total} searches. ${result.failed} couldn't be checked this time.`,
        });
      } else {
        setPhase({ kind: "done", tone: "positive", message: `Checked all ${result.total} searches. Results are updated.` });
      }
    } catch {
      setPhase({
        kind: "error",
        message: "The check is taking longer than your connection allows. It may still finish: refresh the page in a few minutes.",
      });
    }
  }

  if (phase.kind === "confirm") {
    return (
      <div className="flex max-w-sm flex-col gap-2 rounded-panel border border-line bg-surface p-3 md:items-end">
        <p className="text-support text-ink-2">
          This checks your {searches === 1 ? "search" : `${searches} searches`} in Google and the AI answers that are turned on. It uses
          search credits and can take a few minutes.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="quiet" onClick={() => setPhase({ kind: "idle" })}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" onClick={run}>
            Start check
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5 md:items-end">
      <Button variant="primary" onClick={() => setPhase({ kind: "confirm" })} disabled={phase.kind === "running" || searches === 0}>
        {phase.kind === "running" ? (
          <>
            <Loader2 size={15} strokeWidth={1.75} className="animate-spin" aria-hidden />
            Checking {searches === 1 ? "1 search" : `${searches} searches`}
          </>
        ) : (
          <>
            <RotateCw size={15} strokeWidth={1.75} aria-hidden />
            {label}
          </>
        )}
      </Button>
      {phase.kind === "running" && <p className="text-support text-ink-3">This usually takes one to three minutes.</p>}
      {phase.kind === "done" && (
        <p role="status" className={phase.tone === "positive" ? "text-support text-positive" : "text-support text-attention"}>
          {phase.message}
        </p>
      )}
      {phase.kind === "error" && (
        <p role="alert" className="max-w-xs text-support text-critical">
          {phase.message}
        </p>
      )}
    </div>
  );
}
