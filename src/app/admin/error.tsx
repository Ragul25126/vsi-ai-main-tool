"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";
import { PageContainer } from "@/components/ui/Page";
import { Notice } from "@/components/ui/Status";
import { Button } from "@/components/ui/Button";

/** Shown when an admin page fails to render. */
export default function AdminError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => {
    console.error("[admin] page failed", error.digest ?? error.message);
  }, [error]);

  return (
    <PageContainer>
      <Notice
        tone="critical"
        title="This admin page couldn't load"
        action={
          <Button size="sm" onClick={() => unstable_retry()}>
            <RotateCw size={14} strokeWidth={1.75} aria-hidden />
            Try again
          </Button>
        }
      >
        Nothing was changed. This is usually a temporary database or connection problem.
        {error.digest ? ` Reference: ${error.digest}.` : ""}
      </Notice>
    </PageContainer>
  );
}
