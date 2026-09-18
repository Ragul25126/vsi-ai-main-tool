import { getAllSettings } from "@/lib/settings";
import SettingsToggles from "@/components/admin/SettingsToggles";

export default async function AdminSettingsPage() {
  const settings = await getAllSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Pipeline-wide toggles. Changes apply to all agencies on the next run.</p>
      </div>

      <SettingsToggles initial={settings as Record<string, boolean>} />
    </div>
  );
}
