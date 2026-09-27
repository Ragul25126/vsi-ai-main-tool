"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { ProjectSummary } from "@/lib/project-types";

const ActiveProjectContext = createContext<ProjectSummary | null>(null);

/** Gives client components the server-resolved active project, matching route-specific client ID when available. */
export function ProjectProvider({
  project,
  projects = [],
  children,
}: {
  project: ProjectSummary | null;
  projects?: ProjectSummary[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const matchId = pathname?.match(/^\/dashboard\/clients\/([a-f0-9-]{36})/i)?.[1];
  const activeProject = (matchId ? projects.find((p) => p.id === matchId) : null) ?? project;

  return <ActiveProjectContext.Provider value={activeProject}>{children}</ActiveProjectContext.Provider>;
}

export function useActiveProject() {
  return useContext(ActiveProjectContext);
}
