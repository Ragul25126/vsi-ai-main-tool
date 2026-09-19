import type { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/auth";
import { getAllSettings } from "@/lib/settings";
import { PageContainer, PageHeader } from "@/components/ui/Page";
import { SettingsTabs } from "@/components/admin/SettingsTabs";
import SettingsToggles from "@/components/admin/SettingsToggles";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireSuperAdmin();
  const settings = await getAllSettings();

  return (
    <PageContainer>
      <PageHeader title="Settings" description="Platform-wide switches. Changes apply to every organization from the next check, and are recorded in Activity." />
      <SettingsTabs current="pipeline" />
      <SettingsToggles initial={settings as Record<string, boolean>} />
    </PageContainer>
  );
}
