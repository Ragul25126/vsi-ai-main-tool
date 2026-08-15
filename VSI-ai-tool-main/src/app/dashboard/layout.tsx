import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ChatFloating from "@/components/ChatFloating";
import FeedbackButton from "@/components/FeedbackButton";
import PilotBanner from "@/components/PilotBanner";
import ScrollToTop from "@/components/ScrollToTop";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";
import type { ServiceType } from "@/types/search";

import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { MessagesProvider } from "@/contexts/MessagesContext";
import { FeedbackProvider } from "@/contexts/FeedbackContext";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAgency();

  const supabase = await createClient();
  const isSuperAdmin = session.role === "super_admin";

  const clientsQuery = isSuperAdmin
    ? supabase
        .from("clients")
        .select("id, name, service_type, agencies(name, display_name)")
        .order("created_at", { ascending: true })
    : supabase
        .from("clients")
        .select("id, name, service_type")
        .eq("agency_id", session.agencyId)
        .order("created_at", { ascending: true });

  const [{ data: clients }, { data: agency }] = await Promise.all([
    clientsQuery,
    supabase
      .from("agencies")
      .select("max_clients, is_pilot")
      .eq("id", session.agencyId)
      .maybeSingle(),
  ]);

  const isPilot = !agency?.is_pilot;

  type ClientRow = {
    id: string; name: string; service_type: string | null;
    agencies?: { name?: string | null; display_name?: string | null } | { name?: string | null; display_name?: string | null }[] | null;
  };

  const safeClients = ((clients ?? []) as ClientRow[]).map((c) => {
    const agencyJoin = Array.isArray(c.agencies) ? c.agencies[0] : c.agencies;
    const agencyName = agencyJoin?.display_name ?? agencyJoin?.name ?? null;
    return {
      id: c.id,
      name: c.name,
      service_type: (c.service_type ?? "geo") as ServiceType,
      agencyName: isSuperAdmin ? agencyName : null,
    };
  });

  const maxClients = agency?.max_clients as number | null | undefined;
  const atClientCap = !isSuperAdmin && typeof maxClients === "number" && safeClients.length >= maxClients;

  return (
    <NotificationsProvider>
      <MessagesProvider>
        <FeedbackProvider>
          <ScrollToTop />
          <div className="md:flex min-h-screen md:h-screen bg-background text-foreground selection:bg-blue-500/20 relative overflow-x-hidden font-sans" suppressHydrationWarning>
            <Sidebar
              agencyName={session.branding.displayName || session.agencyName}
              agencyLogoUrl={session.branding.logoUrl}
              clients={safeClients}
              userRole={session.role}
              userEmail={session.email}
              atClientCap={atClientCap}
            />
            <main className="flex-1 flex flex-col md:overflow-y-auto relative z-10 min-w-0" data-scroll-container>
              <Topbar
                userEmail={session.email}
                userRole={session.role}
                agencyName={session.branding.displayName || session.agencyName}
              />
              <PilotBanner />
              <div className="flex-1">
                {children}
              </div>
            </main>
            <ChatFloating />
            <FeedbackButton />
          </div>
        </FeedbackProvider>
      </MessagesProvider>
    </NotificationsProvider>
  );
}
