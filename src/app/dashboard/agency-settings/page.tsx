"use client";

import { useState } from "react";
import { Settings, Palette, Mail, FileText, Globe, Save, Building2, Check, Upload, Shield, Bell, CreditCard, ChevronRight, Link2 } from "lucide-react";

const SECTIONS = [
  { id: "branding", label: "Agency Branding", icon: Palette, desc: "Logo, colors & display name" },
  { id: "account", label: "Account", icon: Building2, desc: "Plan & agency details" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Alert preferences" },
  { id: "email", label: "Email & Reports", icon: Mail, desc: "Report sending settings" },
  { id: "billing", label: "Billing", icon: CreditCard, desc: "Plan and usage" },
];

export default function AgencySettingsPage() {
  const [activeSection, setActiveSection] = useState("branding");
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    legal_name: "ValGrow Digital",
    display_name: "ValGrow Digital",
    logo_url: "",
    primary_color: "var(--brand)",
    support_email: "support@valgrow.com",
    report_footer: "© 2025 ValGrow Digital. All rights reserved.",
    notif_email: true,
    notif_weekly: true,
    notif_tasks: false,
  });

  const update = (key: string, val: string | boolean) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const activeInfo = SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="min-h-[calc(100vh-60px)] bg-canvas p-3 sm:p-6 font-sans text-ink">
      <div className="max-w-[1400px] mx-auto bg-surface rounded-[2rem] p-6 lg:p-8 shadow-overlay border border-line min-h-[calc(100vh-108px)]">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8 border-b border-line pb-6">
          <div className="w-10 h-10 rounded-panel bg-brand-soft border border-line flex items-center justify-center text-brand-strong">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-display font-semibold text-ink">Organization settings</h1>
            <p className="text-body text-ink-3 mt-0.5">Branding, connections and preferences for your organization.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left Navigation Tabs */}
          <nav className="lg:w-64 shrink-0">
            <div className="bg-surface border border-line rounded-panel p-2 space-y-1">
              {SECTIONS.map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-panel text-body transition-all text-left group cursor-pointer ${
                    activeSection === id
                      ? "bg-ink text-white font-semibold "
                      : "text-ink-3 hover:text-ink hover:bg-surface-2 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${activeSection === id ? "text-white" : "text-ink-3 group-hover:text-ink"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-none">{label}</p>
                    <p className={`text-caption mt-0.5 leading-none ${activeSection === id ? "text-white/80 font-medium" : "text-ink-3"}`}>{desc}</p>
                  </div>
                  {activeSection === id && <ChevronRight className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              ))}
            </div>
          </nav>

          {/* Content Panel */}
          <div className="flex-1">
            <div className="bg-surface border border-line rounded-panel p-6 lg:p-8 space-y-6 h-full">

              {/* Section title */}
              <div className="pb-4 border-b border-line">
                <h2 className="text-lg font-semibold text-ink">{activeInfo?.label}</h2>
                <p className="text-body text-ink-3 mt-0.5">{activeInfo?.desc}</p>
              </div>

              {/* ── BRANDING ── */}
              {activeSection === "branding" && (
                <div className="space-y-6">
                  {/* Logo */}
                  <div>
                    <label className="block text-caption font-semibold text-ink-3 mb-3">Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-panel bg-surface-2 border border-line flex items-center justify-center">
                        <span className="text-3xl font-semibold text-brand-strong">V</span>
                      </div>
                      <div className="space-y-2">
                        <button className="flex items-center gap-2 bg-surface-2 border border-line hover:border-line text-ink text-body font-semibold px-4 py-2.5 rounded-panel transition-colors cursor-pointer">
                          <Upload className="w-4 h-4 text-brand-strong" />
                          Upload logo
                        </button>
                        <p className="text-caption text-ink-3">PNG, JPG up to 2MB. Recommended: 200×200px</p>
                      </div>
                    </div>
                  </div>

                  {/* Names */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-caption font-semibold text-ink mb-2">Legal Name</label>
                      <input
                        value={form.legal_name}
                        onChange={e => update("legal_name", e.target.value)}
                        className="w-full bg-canvas border border-line focus:border-line-strong rounded-panel px-4 py-3 text-body text-ink placeholder:text-ink-3/70 focus:outline-none transition-colors"
                        placeholder="Your Agency LLC"
                      />
                    </div>
                    <div>
                      <label className="block text-caption font-semibold text-ink mb-2">Display Name</label>
                      <input
                        value={form.display_name}
                        onChange={e => update("display_name", e.target.value)}
                        className="w-full bg-canvas border border-line focus:border-line-strong rounded-panel px-4 py-3 text-body text-ink placeholder:text-ink-3/70 focus:outline-none transition-colors"
                        placeholder="My Agency"
                      />
                    </div>
                  </div>

                  {/* Brand Color */}
                  <div>
                    <label className="block text-caption font-semibold text-ink mb-3">Brand Color</label>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="color"
                          value={form.primary_color}
                          onChange={e => update("primary_color", e.target.value)}
                          className="w-12 h-12 rounded-panel cursor-pointer border border-line p-1 bg-canvas"
                          style={{ appearance: "none" }}
                        />
                      </div>
                      <input
                        value={form.primary_color}
                        onChange={e => update("primary_color", e.target.value)}
                        className="w-36 bg-canvas border border-line focus:border-line-strong rounded-panel px-4 py-3 text-body text-ink focus:outline-none transition-colors"
                        placeholder="#FF4500"
                      />
                      <div className="flex-1 bg-surface-2 border border-line rounded-panel p-3">
                        <p className="text-caption text-ink-3">Used in client-facing reports, PDF exports, and email templates</p>
                      </div>
                    </div>
                  </div>

                  {/* Preview Card */}
                  <div className="bg-surface-2/50 border border-line rounded-panel p-5">
                    <p className="text-caption font-semibold text-ink-3 mb-3">Preview - Report Header</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-panel flex items-center justify-center font-semibold text-xl text-white" style={{ backgroundColor: form.primary_color }}>
                        {form.display_name.charAt(0) || "A"}
                      </div>
                      <div>
                        <p className="text-body font-semibold text-ink">{form.display_name || "Your Agency"}</p>
                        <p className="text-caption font-semibold" style={{ color: form.primary_color }}>SearchIntel Report</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ACCOUNT ── */}
              {activeSection === "account" && (
                <div className="space-y-5">
                  <div className="bg-positive/10 border border-positive/30 rounded-panel p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-panel bg-positive/20 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-positive" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-ink">Pilot Plan</p>
                        <p className="text-caption text-ink-3 mt-0.5">Unlimited keywords · Full feature access · Priority support</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-control bg-positive/20 border border-positive/30 text-positive text-caption font-semibold">Active</span>
                  </div>

                  {[
                    { label: "Agency ID", value: "00000000-0000-0000-0000-000000000001", mono: true },
                    { label: "User Email", value: "admin@example.com", mono: false },
                    { label: "User Role", value: "Super Admin", mono: false },
                    { label: "Max Keywords", value: "1,000", mono: false },
                  ].map(({ label, value, mono }) => (
                    <div key={label}>
                      <label className="block text-caption font-semibold text-ink-3 mb-2">{label}</label>
                      <div className={`bg-surface-2 border border-line rounded-panel px-4 py-3 text-body ${mono ? "font-mono text-ink-3" : "text-ink font-semibold"}`}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeSection === "notifications" && (
                <div className="space-y-4">
                  {[
                    { key: "notif_email", label: "Email Alerts", desc: "Receive alerts when keyword rankings change significantly" },
                    { key: "notif_weekly", label: "Weekly Digest", desc: "Get a weekly summary of all client performance metrics" },
                    { key: "notif_tasks", label: "Task Due Notifications", desc: "Get notified when tasks are overdue or context has changed" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="bg-surface-2 border border-line rounded-panel p-5 flex items-center justify-between">
                      <div>
                        <p className="text-body font-semibold text-ink">{label}</p>
                        <p className="text-caption text-ink-3 mt-0.5">{desc}</p>
                      </div>
                      <button
                        onClick={() => update(key, !(form as Record<string, unknown>)[key])}
                        className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ml-4 cursor-pointer ${
                          (form as Record<string, unknown>)[key] ? "bg-ink" : "bg-surface-2 border border-line"
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-card rounded-full shadow transition-all ${
                          (form as Record<string, unknown>)[key] ? "left-7" : "left-1"
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── EMAIL ── */}
              {activeSection === "email" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-caption font-semibold text-ink mb-2">Support Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
                      <input
                        value={form.support_email}
                        onChange={e => update("support_email", e.target.value)}
                        className="w-full bg-canvas border border-line focus:border-line-strong rounded-panel pl-11 pr-4 py-3 text-body text-ink placeholder:text-ink-3/70 focus:outline-none transition-colors"
                        placeholder="support@yourcompany.com"
                      />
                    </div>
                    <p className="text-caption text-ink-3 mt-1.5">Shown to clients in exported reports</p>
                  </div>
                  <div>
                    <label className="block text-caption font-semibold text-ink mb-2">Report Footer Text</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 w-4 h-4 text-ink-3" />
                      <textarea
                        value={form.report_footer}
                        onChange={e => update("report_footer", e.target.value)}
                        rows={3}
                        className="w-full bg-canvas border border-line focus:border-line-strong rounded-panel pl-11 pr-4 py-3 text-body text-ink placeholder:text-ink-3/70 focus:outline-none transition-colors resize-none"
                        placeholder="© 2025 Your Agency. All rights reserved."
                      />
                    </div>
                  </div>
                </div>
              )}



              {/* ── BILLING ── */}
              {activeSection === "billing" && (
                <div className="space-y-5">
                  <div className="bg-brand-soft border border-line rounded-panel p-6">
                    <p className="text-caption text-brand-strong font-semibold mb-1">Current Plan</p>
                    <p className="text-2xl font-semibold text-ink">Pilot</p>
                    <p className="text-body text-ink-3 mt-1">Full access to all features during the pilot program</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Keywords Used", value: "37 / 1,000" },
                      { label: "Clients", value: "9" },
                      { label: "Reports Run", value: "142" },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-surface-2 border border-line rounded-panel p-4 text-center">
                        <p className="text-xl font-semibold text-ink">{value}</p>
                        <p className="text-caption text-ink-3 mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              {!["billing", "account"].includes(activeSection) && (
                <div className="pt-4 border-t border-line">
                  <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-6 py-3 rounded-panel text-body font-semibold transition-all cursor-pointer ${
                      saved
                        ? "bg-positive/10 border border-positive/30 text-positive"
                        : "bg-ink hover:bg-ink-2 text-white "
                    }`}
                  >
                    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? "Changes saved!" : "Save changes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
