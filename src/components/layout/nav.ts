import {
  LayoutGrid,
  ShieldCheck,
  TrendingUp,
  MessageSquareText,
  Users,
  ListChecks,
  CheckSquare,
  FileText,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  /** Build the href for the active project (some routes are project-scoped). */
  href: (projectId: string | null) => string;
  Icon: LucideIcon;
  isActive: (pathname: string, tab: string | null) => boolean;
}

export interface NavGroup {
  title: string | null;
  items: NavItem[];
}

const clientSub = (pathname: string, sub: string) => /^\/dashboard\/clients\/[^/]+\//.test(pathname) && pathname.includes(`/${sub}`);

export const NAV_GROUPS: NavGroup[] = [
  {
    title: null,
    items: [
      {
        label: "Overview",
        href: () => "/dashboard",
        Icon: LayoutGrid,
        isActive: (p) => p === "/dashboard",
      },
    ],
  },
  {
    title: "Website",
    items: [
      {
        label: "Site Audit",
        href: () => "/dashboard/check",
        Icon: ShieldCheck,
        isActive: (p, tab) => p === "/dashboard/check" && tab !== "quick-check",
      },
      {
        label: "Search Visibility",
        href: () => "/dashboard/services/seo",
        Icon: TrendingUp,
        isActive: (p, tab) => p.startsWith("/dashboard/services") || (p === "/dashboard/check" && tab === "quick-check"),
      },
      {
        label: "AI Visibility",
        href: () => "/dashboard/geo",
        Icon: MessageSquareText,
        isActive: (p) => p.startsWith("/dashboard/geo"),
      },
    ],
  },
  {
    title: "Competitors",
    items: [
      {
        label: "Competitors",
        href: () => "/dashboard/competitors",
        Icon: Users,
        isActive: (p) => p.startsWith("/dashboard/competitors"),
      },
    ],
  },
  {
    title: "Actions",
    items: [
      {
        label: "Next Actions",
        href: () => "/dashboard/next-actions",
        Icon: ListChecks,
        isActive: (p) => p.startsWith("/dashboard/next-actions"),
      },
      {
        label: "Tasks",
        href: () => "/dashboard/tasks",
        Icon: CheckSquare,
        isActive: (p) => p.startsWith("/dashboard/tasks") || clientSub(p, "tasks"),
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        label: "Reports",
        // With a project, go straight to its reports: /dashboard/reports would only redirect there.
        // Without one, /dashboard/reports shows the Reports introduction.
        href: (id) => (id ? `/dashboard/clients/${id}/reports` : "/dashboard/reports"),
        Icon: FileText,
        isActive: (p) => p.startsWith("/dashboard/reports") || clientSub(p, "reports"),
      },
    ],
  },
  {
    title: "AI",
    items: [
      {
        label: "AI Chat",
        href: () => "/dashboard/chat",
        Icon: MessagesSquare,
        isActive: (p) => p.startsWith("/dashboard/chat"),
      },
    ],
  },
];

/** Page names for the top bar, including pages outside the main nav. */
export function pageTitleFor(pathname: string, tab: string | null): string | null {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.isActive(pathname, tab)) {
        return pathname === "/dashboard/check" && tab === "quick-check" ? "Check a search" : item.label;
      }
    }
  }
  if (pathname === "/dashboard/clients") return "Projects";
  if (pathname === "/dashboard/clients/new") return "Add your website";
  if (/^\/dashboard\/clients\/[^/]+\/settings/.test(pathname)) return "Project settings";
  if (/^\/dashboard\/clients\/[^/]+\/keywords/.test(pathname)) return "Searches";
  if (/^\/dashboard\/clients\/[^/]+\/results/.test(pathname)) return "Check history";
  if (/^\/dashboard\/clients\/[^/]+$/.test(pathname)) return "Project";
  if (pathname.startsWith("/dashboard/settings")) return "Settings";
  if (pathname.startsWith("/dashboard/agency-settings")) return "Organization";
  if (pathname.startsWith("/dashboard/help")) return "Help";
  if (pathname.startsWith("/dashboard/feedback")) return "Feedback";
  if (pathname.startsWith("/dashboard/messages")) return "Messages";
  if (pathname.startsWith("/dashboard/notifications")) return "Notifications";
  if (pathname.startsWith("/dashboard/prompts")) return "Search simulator";
  return null;
}
