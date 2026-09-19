import { Tabs } from "./bits";

/** Tabs shared by the Settings pages. */
export function SettingsTabs({ current }: { current: "pipeline" | "prompts" | "qa" }) {
  return (
    <Tabs
      current={current}
      tabs={[
        { key: "pipeline", label: "Pipeline", href: "/admin/settings" },
        { key: "prompts", label: "AI prompts", href: "/admin/settings/prompts" },
        { key: "qa", label: "QA checklist", href: "/admin/settings/qa" },
      ]}
    />
  );
}
