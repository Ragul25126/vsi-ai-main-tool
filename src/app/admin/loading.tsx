import { PageContainer } from "@/components/ui/Page";
import { Skeleton } from "@/components/ui/Metrics";

/** Placeholder in the shape of an admin page (header, summary, table) while data loads. */
export default function AdminLoading() {
  return (
    <PageContainer>
      <div aria-busy="true" aria-label="Loading" className="space-y-8">
        <div className="space-y-3 border-b border-line pb-6">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="rounded-panel border border-line bg-surface">
          <Skeleton className="h-10 w-full rounded-none rounded-t-panel" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-t border-line px-4 py-3">
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
