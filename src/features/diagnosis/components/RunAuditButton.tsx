"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Phase = { kind: "idle" } | { kind: "running" } | { kind: "error"; message: string };

const POLL_MS = 3000;
const GIVE_UP_MS = 6 * 60 * 1000;

/**
 * Starts an audit and follows its real status until it finishes.
 * Progress is the job's actual state, never a timer.
 */
export function RunAuditButton({
  clientId,
  runningId,
  label = "Run audit",
  variant = "primary",
}: {
  clientId: string;
  runningId?: string | null;
  label?: string;
  variant?: "primary" | "secondary";
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(runningId ? { kind: "running" } : { kind: "idle" });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Follows the job until it leaves "running". Kept in a ref because it reschedules itself.
  const pollRef = useRef<(id: string, startedAt: number) => void>(() => {});
  useEffect(() => {
    pollRef.current = (id, startedAt) => {
      timer.current = setTimeout(async () => {
        if (Date.now() - startedAt > GIVE_UP_MS) {
          setPhase({ kind: "error", message: "The audit is taking longer than expected. Refresh the page in a few minutes." });
          return;
        }
        try {
          const res = await fetch(`/api/site-audit/${id}`, { cache: "no-store" });
          if (res.ok) {
            const data = (await res.json()) as { status: string };
            if (data.status !== "running") {
              setPhase({ kind: "idle" });
              router.refresh();
              return;
            }
          }
        } catch {
          /* transient network error: keep polling */
        }
        pollRef.current(id, startedAt);
      }, POLL_MS);
    };
  }, [router]);

  useEffect(() => {
    if (runningId) pollRef.current(runningId, Date.now());
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [runningId]);

  async function start() {
    setPhase({ kind: "running" });
    try {
      const res = await fetch("/api/site-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });
      const body = (await res.json().catch(() => ({}))) as { id?: string; error?: { code?: string; message?: string } };
      if (res.status === 409) {
        setPhase({ kind: "idle" });
        router.refresh();
        return;
      }
      if (!res.ok || !body.id) {
        setPhase({ kind: "error", message: body.error?.message ?? "We couldn't start the audit. Please try again." });
        return;
      }
      router.refresh();
      pollRef.current(body.id, Date.now());
    } catch {
      setPhase({ kind: "error", message: "We couldn't reach VSI. Check your connection and try again." });
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5 md:items-end">
      <Button variant={variant} onClick={start} disabled={phase.kind === "running"}>
        {phase.kind === "running" ? (
          <>
            <Loader2 size={15} strokeWidth={1.75} className="animate-spin" aria-hidden />
            Auditing your site
          </>
        ) : (
          <>
            <RotateCw size={15} strokeWidth={1.75} aria-hidden />
            {label}
          </>
        )}
      </Button>
      {phase.kind === "error" && (
        <p role="alert" className="max-w-xs text-support text-critical">
          {phase.message}
        </p>
      )}
    </div>
  );
}
