import {
  BarChart3,
  Building2,
  FolderKanban,
  HeartPulse,
  History,
  LayoutGrid,
  ListChecks,
  MessageSquare,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  Icon: LucideIcon;
  /** Extra path prefixes that count as this item (e.g. detail pages). */
  match?: string[];
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

/**
 * Platform admin navigation. Billing is left out on purpose: it isn't
 * implemented, so there is nothing true to show.
 */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: "Platform",
    items: [
      { label: "Overview", href: "/admin", Icon: LayoutGrid },
      { label: "Organizations", href: "/admin/organizations", Icon: Building2 },
      { label: "Users", href: "/admin/users", Icon: Users },
      { label: "Projects", href: "/admin/projects", Icon: FolderKanban },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Jobs", href: "/admin/jobs", Icon: ListChecks },
      { label: "System Health", href: "/admin/health", Icon: HeartPulse },
      { label: "Activity", href: "/admin/activity", Icon: History },
      { label: "Feedback", href: "/admin/feedback", Icon: MessageSquare },
    ],
  },
  {
    title: "Business",
    items: [{ label: "Usage", href: "/admin/usage", Icon: BarChart3 }],
  },
  {
    title: "System",
    items: [{ label: "Settings", href: "/admin/settings", Icon: Settings }],
  },
];

export function isAdminNavActive(item: AdminNavItem, pathname: string): boolean {
  if (item.href === "/admin") return pathname === "/admin";
  return pathname === item.href || pathname.startsWith(`${item.href}/`) || (item.match ?? []).some((m) => pathname.startsWith(m));
}

export function adminPageTitle(pathname: string): string | null {
  for (const g of ADMIN_NAV) for (const i of g.items) if (isAdminNavActive(i, pathname)) return i.label;
  return null;
}
