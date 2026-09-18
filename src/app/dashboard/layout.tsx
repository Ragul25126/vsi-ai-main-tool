import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ChatFloating from "@/components/ChatFloating";
import PilotBanner from "@/components/PilotBanner";
import ScrollToTop from "@/components/ScrollToTop";
import { ProjectProvider } from "@/components/layout/ProjectProvider";
import { createClient } from "@/lib/supabase/server";
import { requireAgency, isDummySupabase } from "@/lib/auth";
import { getProjectContext } from "@/lib/project-context";

import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { MessagesProvider } from "@/contexts/MessagesContext";
import { FeedbackProvider } from "@/contexts/FeedbackContext";

async function loadAgencyLimits(agencyId: string) {
  if (isDummySupabase()) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("agencies").select("max_clients").eq("id", agencyId).maybeSingle();
  return data as { max_clients: number | null } | null;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAgency();
  const isSuperAdmin = session.role === "super_admin";

  const [projectContext, agency] = await Promise.all([getProjectContext(session), loadAgencyLimits(session.agencyId)]);

  const maxClients = agency?.max_clients;
  const atClientCap = !isSuperAdmin && typeof maxClients === "number" && projectContext.projects.length >= maxClients;
  const agencyName = session.branding.displayName || session.agencyName;

  return (
    <NotificationsProvider>
      <MessagesProvider>
        <FeedbackProvider>
          <ProjectProvider project={projectContext.active}>
            <ScrollToTop />
            <div className="relative min-h-screen overflow-x-hidden bg-canvas font-sans text-ink md:flex md:h-screen">
              <Sidebar
                agencyName={agencyName}
                projects={projectContext.projects}
                activeProjectId={projectContext.active?.id ?? null}
                userRole={session.role}
                userEmail={session.email}
                atClientCap={atClientCap}
              />
              <div className="flex min-w-0 flex-1 flex-col md:h-screen md:overflow-hidden">
                <Topbar userEmail={session.email} userRole={session.role} agencyName={agencyName} />
                <PilotBanner />
                <main className="min-w-0 flex-1 md:overflow-y-auto" data-scroll-container>
                  {children}
                </main>
              </div>
              <ChatFloating />
            </div>
          </ProjectProvider>
        </FeedbackProvider>
      </MessagesProvider>
    </NotificationsProvider>
  );
}
