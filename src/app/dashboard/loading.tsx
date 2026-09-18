import { PageContainer } from "@/components/ui/Page";
import { Skeleton } from "@/components/ui/Metrics";

/** Placeholder in the shape of a dashboard page while its data loads. */
export default function DashboardLoading() {
  return (
    <PageContainer>
      <div aria-busy="true" aria-label="Loading" className="space-y-10">
        <div className="space-y-3 border-b border-line pb-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
