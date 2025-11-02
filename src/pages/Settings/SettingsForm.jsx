// /src/pages/Settings/SettingsForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import AdminForm from "../../components/ui/AdminForm";
import { useSettingsStore } from "../../stores/useSettingsStore";

export default function SettingsForm({ onSuccess }) {
  const [searchParams] = useSearchParams();
  const isReadOnly =
    searchParams.get("readonly") === "1" || searchParams.get("mode") === "view";

  const loading   = useSettingsStore((s) => s.loading);
  const settings  = useSettingsStore((s) => s.settings);
  const error     = useSettingsStore((s) => s.error);

  const fetchSettings  = useSettingsStore((s) => s.fetchSettings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    siteName: "",
    email: "",
    phone: "",
    address: "",
    socials: { facebook: "", whatsapp: "", instagram: "", twitter: "", linkedin: "" },
  });

  // Seed with existing (previous) settings
  const seed = (data) => {
    setForm({
      siteName: data?.siteName || data?.site_name || "",
      email: data?.email || "",
      phone: data?.phone || "",
      address: data?.address || "",
      socials: {
        facebook: data?.socials?.facebook || data?.facebook || "",
        whatsapp: data?.socials?.whatsapp || data?.whatsapp || "",
        instagram: data?.socials?.instagram || data?.instagram || "",
        twitter: data?.socials?.twitter || data?.twitter || "",
        linkedin: data?.socials?.linkedin || data?.linkedin || "",
      },
    });
  };

  useEffect(() => {
    // Ensure settings are loaded once, then seed.
    if (!settings) {
      fetchSettings().catch((e) => console.error("fetchSettings", e));
    } else {
      seed(settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (settings) seed(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const setField  = (name, value) => setForm((p) => ({ ...p, [name]: value }));
  const setSocial = (k, v) => setForm((p) => ({ ...p, socials: { ...p.socials, [k]: v } }));

  const valid = useMemo(
    () =>
      form.siteName.trim() &&
      /\S+@\S+\.\S+/.test(form.email) &&
      form.phone.trim() &&
      form.address.trim(),
    [form]
  );

  const submit = async (e) => {
    e.preventDefault();
    if (isReadOnly) { onSuccess && onSuccess(); return; } // Close in view-only
    if (!valid) return;
    try {
      setSaving(true);
      await updateSettings({ ...form });
      onSuccess && onSuccess();
    } catch (e) {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white";

  const disabledCls = isReadOnly
    ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed border-gray-200 dark:border-gray-700"
    : "border-gray-300";

  const SocialRow = ({ label, value, onChange }) => (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-28 items-center justify-start text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      <input
        type="url"
        inputMode="url"
        className={`${inputCls} ${disabledCls}`}
        value={value}
        onChange={(e) => !isReadOnly && onChange(e.target.value)}
        disabled={isReadOnly}
      />
    </div>
  );

  return (
    <PageLayout title={`${isReadOnly ? "View" : "Edit"} Settings | ProfMSE`}>
      {/* Fixed width container (1400px) */}
      <div className="mx-auto w-[1400px] max-w-[1400px] px-4">
        <PageHeader title={`${isReadOnly ? "View" : "Edit"} Settings`} />

        {/* Loading / Error */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            Loading settings…
          </div>
        )}
        {!loading && error && (
          <div className="text-center text-red-600">{String(error)}</div>
        )}

        {/* Form */}
        {!loading && !error && (
          <AdminForm
            title="Site Information"
            onSubmit={submit}
            onCancel={onSuccess}
            submitText={
              isReadOnly ? "Close" : saving ? "Saving..." : "Save Settings"
            }
            submitDisabled={isReadOnly ? false : saving || !valid}
          >
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Name *
                </label>
                <input
                  type="text"
                  value={form.siteName}
                  onChange={(e) => setField("siteName", e.target.value)}
                  className={`${inputCls} ${disabledCls}`}
                  required
                  maxLength={140}
                  disabled={isReadOnly}
                />
                <p className="text-xs text-gray-500 mt-1">{form.siteName.length}/140</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className={`${inputCls} ${disabledCls}`}
                  required
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className={`${inputCls} ${disabledCls}`}
                  required
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  className={`${inputCls} ${disabledCls}`}
                  required
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Socials */}
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Social Links</h3>
              <SocialRow label="Facebook" value={form.socials.facebook} onChange={(v) => setSocial("facebook", v)} />
              <SocialRow label="WhatsApp" value={form.socials.whatsapp} onChange={(v) => setSocial("whatsapp", v)} />
              <SocialRow label="Instagram" value={form.socials.instagram} onChange={(v) => setSocial("instagram", v)} />
              <SocialRow label="Twitter" value={form.socials.twitter} onChange={(v) => setSocial("twitter", v)} />
              <SocialRow label="LinkedIn" value={form.socials.linkedin} onChange={(v) => setSocial("linkedin", v)} />
            </div>
          </AdminForm>
        )}
      </div>
    </PageLayout>
  );
}
