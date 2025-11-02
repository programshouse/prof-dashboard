import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import AdminForm from "../../components/ui/AdminForm";
import { useSettingsStore } from "../../stores/useSettingsStore";

export default function SettingsForm({ onSuccess }) {
  const loading = useSettingsStore((s) => s.loading);
  const settings = useSettingsStore((s) => s.settings);
  const error = useSettingsStore((s) => s.error);

  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    siteName: "",
    email: "",
    phone: "",
    address: "",
    socials: { facebook: "", whatsapp: "", instagram: "", twitter: "", linkedin: "" },
  });

  useEffect(() => {
    // Ensure settings are loaded once
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

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));
  const setSocial = (k, v) => setForm((p) => ({ ...p, socials: { ...p.socials, [k]: v } }));

  const valid = useMemo(() => (
    form.siteName.trim() && /\S+@\S+\.\S+/.test(form.email) && form.phone.trim() && form.address.trim()
  ), [form]);

  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    try {
      setSaving(true);
      await updateSettings({ ...form });
      onSuccess && onSuccess();
    } catch (e) {
      alert("Failed to save settings.");
    } finally { setSaving(false); }
  };

  const inputCls =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white";

  const SocialRow = ({ label, value, onChange }) => (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-28 items-center justify-start text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      <input type="url" inputMode="url" className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );

  return (
    <PageLayout title="Edit Settings | ProfMSE">
      <PageHeader title="Edit Settings" />
      <AdminForm
        title="Site Information"
        onSubmit={submit}
        onCancel={onSuccess}
        submitText={saving ? "Saving..." : "Save Settings"}
        submitDisabled={saving || !valid}
      >
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Name *</label>
            <input type="text" value={form.siteName} onChange={(e) => setField("siteName", e.target.value)} className={inputCls} required maxLength={140} />
            <p className="text-xs text-gray-500 mt-1">{form.siteName.length}/140</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} className={inputCls} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone *</label>
            <input type="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)} className={inputCls} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address *</label>
            <input type="text" value={form.address} onChange={(e) => setField("address", e.target.value)} className={inputCls} required />
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
    </PageLayout>
  );
}
