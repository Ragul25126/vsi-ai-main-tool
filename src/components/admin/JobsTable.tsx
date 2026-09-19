"use client";

import { useState } from "react";
import Link from "next/link";
import { Drawer } from "@/components/ui/Drawer";
import { Disclosure } from "@/components/ui/Disclosure";
import { Button } from "@/components/ui/Button";
import { formatDuration } from "@/lib/format";
import { JOB_TYPE_LABEL, type AdminJob } from "@/lib/admin/jobs-model";
import { DataTable } from "./DataTable";
import { DetailList, JobStatus, When } from "./bits";

/** Jobs list. Failed and stuck jobs open a panel explaining what happened. */
export function JobsTable({ jobs, empty, showOrg = true }: { jobs: AdminJob[]; empty: string; showOrg?: boolean }) {
  const [open, setOpen] = useState<AdminJob | null>(null);

  const cols = [
    { label: "Job" },
    { label: "Project" },
    ...(showOrg ? [{ label: "Organization", hideOnMobile: true }] : []),
    { label: "Type", hideOnMobile: true },
    { label: "Status" },
    { label: "Started" },
    { label: "Completed", hideOnMobile: true },
    { label: "Duration", hideOnMobile: true, className: "tabular" },
  ];

  return (
    <>
      <DataTable
        caption="Jobs"
        columns={cols}
        rows={jobs.map((j) => {
          const duration = formatDuration(j.startedAt, j.finishedAt);
          return {
            key: j.id,
            cells: [
              <span key="t" className="block min-w-0">
                <span className="block">{j.title}</span>
                {(j.status === "failed" || j.stuck) && (
                  <Button size="sm" variant="quiet" className="-ml-3 mt-0.5 h-7 text-support underline-offset-4 hover:underline" onClick={() => setOpen(j)}>
                    What happened
                  </Button>
                )}
              </span>,
              j.projectId ? (
                <Link key="p" href={`/admin/projects/${j.projectId}`} className="hover:text-ink hover:underline">
                  {j.projectName ?? "Unnamed project"}
                </Link>
              ) : (
                <span key="p" className="text-ink-3">All projects</span>
              ),
              ...(showOrg
                ? [
                    j.agencyId ? (
                      <Link key="o" href={`/admin/organizations/${j.agencyId}`} className="hover:text-ink hover:underline">
                        {j.agencyName ?? "Unnamed organization"}
                      </Link>
                    ) : (
                      <span key="o" className="text-ink-3">Platform</span>
                    ),
                  ]
                : []),
              JOB_TYPE_LABEL[j.type],
              <JobStatus key="s" job={j} />,
              <When key="st" iso={j.startedAt} />,
              <When key="f" iso={j.finishedAt} missing={j.status === "running" ? "Still running" : "Not recorded"} />,
              duration ?? <span key="d" className="text-ink-3">Not recorded</span>,
            ],
          };
        })}
        empty={empty}
      />

      <Drawer open={!!open} onClose={() => setOpen(null)} title={open?.title ?? ""}>
        {open && (
          <div className="space-y-5">
            <p className="text-body text-ink">
              {open.stuck
                ? "This job has been running much longer than it should. It most likely stopped without recording a result. Running it again usually fixes it."
                : open.problem}
            </p>
            <DetailList
              items={[
                { label: "When", value: <When iso={open.startedAt} /> },
                { label: "Type", value: JOB_TYPE_LABEL[open.type] },
                { label: "Project", value: open.projectId ? <Link className="underline-offset-4 hover:underline" href={`/admin/projects/${open.projectId}`}>{open.projectName ?? "Unnamed project"}</Link> : "All projects" },
                { label: "Organization", value: open.agencyId ? <Link className="underline-offset-4 hover:underline" href={`/admin/organizations/${open.agencyId}`}>{open.agencyName ?? "Unnamed organization"}</Link> : "Platform" },
              ]}
            />
            <Disclosure summary="Technical details">
              <dl className="space-y-2 pt-2">
                {open.technical.map((t) => (
                  <div key={t.label}>
                    <dt className="text-caption text-ink-3">{t.label}</dt>
                    <dd className="break-words font-mono text-caption text-ink-2">{t.value}</dd>
                  </div>
                ))}
              </dl>
            </Disclosure>
          </div>
        )}
      </Drawer>
    </>
  );
}
