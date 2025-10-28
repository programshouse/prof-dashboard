// src/pages/settings/SiteInfoForm.jsx
import React, { useEffect, useState } from "react";
import AdminForm from "../../src/components/ui/AdminForm";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";

// Optional: wire to your real settings API
// import { settingsAPI } from "../../services/api";

export default function SiteInfoForm({
  initialData,          // optional: preload values { siteName, email, phone, address, socials: {facebook,whatsapp,instagram,twitter,linkedin} }
  onSuccess,            // callback after save
  onSubmit,             // optional custom submit(payload) => Promise
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    siteName: "",
    email: "",
    phone: "",
    address: "",
    socials: {
      facebook: "",
      whatsapp: "",
      instagram: "",
      twitter: "",
      linkedin: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      setForm((p) => ({
        ...p,
        siteName: initialData.siteName || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        socials: {
          facebook: initialData?.socials?.facebook || "",
          whatsapp: initialData?.socials?.whatsapp || "",
          instagram: initialData?.socials?.instagram || "",
          twitter: initialData?.socials?.twitter || "",
          linkedin: initialData?.socials?.linkedin || "",
        },
      }));
    }
  }, [initialData]);

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));
  const setSocial = (k, v) =>
    setForm((p) => ({ ...p, socials: { ...p.socials, [k]: v } }));

  const valid =
    form.siteName.trim() &&
    /^\S+@\S+\.\S+$/.test(form.email) &&
    form.phone.trim() &&
    form.address.trim();

  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    try {
      setSaving(true);
      const payload = { ...form };
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        // Fallback example (replace with your API):
        // await settingsAPI.saveSiteInfo(payload);
        console.log("Submitting site info:", payload);
      }
      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => onSuccess && onSuccess();

  const inputCls =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white";

  const SocialRow = ({ icon: Icon, placeholder, value, onChange }) => (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <Icon className="text-gray-600 dark:text-gray-300" />
      </span>
      <input
        type="url"
        inputMode="url"
        placeholder={placeholder}
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  return (
    <AdminForm
      title="Site Information"
      onSubmit={submit}
      onCancel={cancel}
      submitText={saving ? "Saving..." : "Save Settings"}
      submitDisabled={saving || !valid}
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
            className={inputCls}
            placeholder="e.g., ProfMSE"
            required
            maxLength={140}
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
            className={inputCls}
            placeholder="hello@domain.com"
            required
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
            className={inputCls}
            placeholder="+20 1X XXX XXXX"
            required
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
            className={inputCls}
            placeholder="Street, City, Country"
            required
          />
        </div>
      </div>

      {/* Socials */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Social Links
        </h3>
        <div className="space-y-4">
          <SocialRow
            icon={FaFacebookF}
            placeholder="Facebook page URL"
            value={form.socials.facebook}
            onChange={(v) => setSocial("facebook", v)}
          />
          <SocialRow
            icon={FaWhatsapp}
            placeholder="WhatsApp link (e.g., https://wa.me/201XXXXXXXXX)"
            value={form.socials.whatsapp}
            onChange={(v) => setSocial("whatsapp", v)}
          />
          <SocialRow
            icon={FaInstagram}
            placeholder="Instagram profile URL"
            value={form.socials.instagram}
            onChange={(v) => setSocial("instagram", v)}
          />
          <SocialRow
            icon={FaTwitter}
            placeholder="X / Twitter profile URL"
            value={form.socials.twitter}
            onChange={(v) => setSocial("twitter", v)}
          />
          <SocialRow
            icon={FaLinkedinIn}
            placeholder="LinkedIn page URL"
            value={form.socials.linkedin}
            onChange={(v) => setSocial("linkedin", v)}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Paste full URLs (including https://). Leave blank for any platform you don’t use.
        </p>
      </div>
    </AdminForm>
  );
}
