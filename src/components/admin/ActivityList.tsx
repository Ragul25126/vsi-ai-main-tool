import Link from "next/link";
import { StatusIcon } from "@/components/ui/Status";
import { dayHeading, type ActivityItem } from "@/lib/admin/activity-model";
import { When, PartialData } from "./bits";

/** Chronological activity, grouped by day: who, what, which entity, when. */
export function ActivityList({ items, unavailable = [], empty }: { items: ActivityItem[]; unavailable?: string[]; empty: string }) {
  const groups = new Map<string, ActivityItem[]>();
  for (const i of items) {
    const h = dayHeading(i.at);
    const list = groups.get(h) ?? [];
    list.push(i);
    groups.set(h, list);
  }

  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <p className="rounded-panel border border-line bg-surface px-4 py-8 text-center text-body text-ink-2">{empty}</p>
      ) : (
        [...groups.entries()].map(([heading, list]) => (
          <section key={heading} className="space-y-2">
            <h2 className="text-support font-medium text-ink-3">{heading}</h2>
            <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
              {list.map((a) => (
                <li key={a.id} className="grid gap-x-4 gap-y-0.5 px-4 py-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline">
                  <p className="min-w-0 text-body text-ink-2">
                    {a.problem && (
                      <span className="mr-1.5 inline-block align-[-2px]">
                        <StatusIcon tone="attention" size={14} />
                      </span>
                    )}
                    <span className="font-medium text-ink">{a.actor}</span> {a.action}
                    {a.entity && (
                      <>
                        {" · "}
                        {a.entityHref ? (
                          <Link href={a.entityHref} className="text-ink underline-offset-4 hover:underline">
                            {a.entity}
                          </Link>
                        ) : (
                          <span className="text-ink">{a.entity}</span>
                        )}
                      </>
                    )}
                    {a.organization && a.organizationId && a.kind !== "organization" && (
                      <span className="text-ink-3">
                        {" · "}
                        <Link href={`/admin/organizations/${a.organizationId}`} className="hover:text-ink hover:underline">
                          {a.organization}
                        </Link>
                      </span>
                    )}
                  </p>
                  <span className="text-support text-ink-3">
                    <When iso={a.at} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
      {unavailable.length > 0 && <PartialData>Not included yet: {unavailable.join("; ")}.</PartialData>}
    </div>
  );
}
