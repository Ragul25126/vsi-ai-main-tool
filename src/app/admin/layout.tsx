import type { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/auth";
import { AdminSidebar, AdminTopbar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = { title: { default: "Platform admin", template: "%s | VSI Platform admin" } };

/**
 * Platform admin shell. The check here is a convenience only: layouts don't
 * re-run on client navigation, so every admin page and data function also
 * calls requireSuperAdmin() itself.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSuperAdmin();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-canvas font-sans text-ink md:flex md:h-screen">
      <AdminSidebar email={session.email} />
      <div className="flex min-w-0 flex-1 flex-col md:h-screen md:overflow-hidden">
        <AdminTopbar />
        <main className="min-w-0 flex-1 md:overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
