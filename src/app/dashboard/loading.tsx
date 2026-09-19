import { PageContainer } from "@/components/ui/Page";
import { Skeleton } from "@/components/ui/Metrics";

/** Placeholder in the shape of a dashboard page while its data loads: header, the lead panel, then a list. */
export default function DashboardLoading() {
  return (
    <PageContainer>
      <div aria-busy="true" aria-label="Loading" className="space-y-10">
        <div className="space-y-3 border-b border-line pb-7">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="grid divide-y divide-line rounded-panel border border-line bg-surface lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,19rem)] lg:divide-x lg:divide-y-0">
          <div className="space-y-3 p-6">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-11 w-28" />
            <Skeleton className="h-1 w-full" />
          </div>
          <div className="space-y-3 p-6 lg:px-8">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-full max-w-md" />
            <Skeleton className="h-5 w-2/3 max-w-sm" />
          </div>
          <div className="space-y-3 p-6">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-44" />
          <div className="divide-y divide-line rounded-panel border border-line bg-surface">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
