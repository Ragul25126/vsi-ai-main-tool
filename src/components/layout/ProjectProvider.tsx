"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ProjectSummary } from "@/lib/project-types";

const ActiveProjectContext = createContext<ProjectSummary | null>(null);

/** Gives client components the server-resolved active project. */
export function ProjectProvider({ project, children }: { project: ProjectSummary | null; children: ReactNode }) {
  return <ActiveProjectContext.Provider value={project}>{children}</ActiveProjectContext.Provider>;
}

export function useActiveProject() {
  return useContext(ActiveProjectContext);
}
