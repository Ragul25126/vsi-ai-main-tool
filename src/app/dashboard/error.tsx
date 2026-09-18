"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";
import { PageContainer } from "@/components/ui/Page";
import { Notice } from "@/components/ui/Status";
import { Button } from "@/components/ui/Button";

/** Shown when a dashboard page fails to render. Nothing is lost; the page can be retried. */
export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] page failed", error.digest ?? error.message);
  }, [error]);

  return (
    <PageContainer>
      <Notice
        tone="critical"
        title="This page couldn't load"
        action={
          <Button size="sm" onClick={() => unstable_retry()}>
            <RotateCw size={14} strokeWidth={1.75} aria-hidden />
            Try again
          </Button>
        }
      >
        Your data is safe. This is usually a temporary connection problem. If it keeps happening, tell us through Feedback
        {error.digest ? ` and mention reference ${error.digest}` : ""}.
      </Notice>
    </PageContainer>
  );
}
