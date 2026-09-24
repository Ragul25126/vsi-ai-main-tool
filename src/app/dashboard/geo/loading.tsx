import { PageContainer } from "@/components/ui/Page";
import { Skeleton } from "@/components/ui/Metrics";

/** Placeholder in the shape of the AI Visibility page: the hero, the four numbers, then the engine list. */
export default function AiVisibilityLoading() {
  return (
    <PageContainer>
      <div aria-busy="true" aria-label="Loading AI Visibility" className="space-y-10">
        <div className="grid items-center gap-8 border-b border-line pb-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-14">
          <div className="space-y-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-full max-w-md" />
            <Skeleton className="h-9 w-2/3 max-w-sm" />
            <Skeleton className="h-4 w-full max-w-lg" />
            <div className="flex gap-2.5 pt-3">
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-9 w-36" />
            </div>
          </div>
          <Skeleton className="hidden h-72 w-full rounded-panel sm:block" />
        </div>
        <div className="grid grid-cols-2 gap-6 rounded-panel border border-line bg-surface p-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-44" />
          <div className="divide-y divide-line rounded-panel border border-line bg-surface">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-2/3 max-w-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
