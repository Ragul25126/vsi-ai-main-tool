import { requireSuperAdmin } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-[#F0F3F8] p-3 sm:p-6 font-sans text-slate-800" suppressHydrationWarning>
      <div className="max-w-[1440px] mx-auto bg-[#F7F9FC] rounded-[2.5rem] p-6 lg:p-8 shadow-overlay border border-slate-200/60 min-h-[calc(100vh-3rem)]">
        <AdminNav />
        <main>{children}</main>
      </div>
    </div>
  );
}
