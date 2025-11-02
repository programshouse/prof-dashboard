import React, { useEffect, useState } from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/button/Button";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { Link } from "react-router-dom";

const Row = ({ label, value }) => (
  <div className="flex items-start gap-4 py-2 border-b border-gray-100 dark:border-gray-800">
    <div className="w-40 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</div>
    <div className="flex-1 text-gray-900 dark:text-gray-100 break-words">{value || "—"}</div>
  </div>
);

export default function SettingsList({ onEdit }) {
  const loading = useSettingsStore((s) => s.loading);
  const error   = useSettingsStore((s) => s.error);
  const data    = useSettingsStore((s) => s.settings);

  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const deleteSettings = useSettingsStore((s) => s.deleteSettings);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSettings().catch((e) => console.error("fetchSettings", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDelete = async () => {
    if (!window.confirm("Are you sure you want to delete current settings?")) return;
    try {
      setDeleting(true);
      await deleteSettings();
    } catch (e) {
      console.error(e);
      alert("Failed to delete settings.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageLayout title="Site Settings | ProfMSE">
      <PageHeader title="Site Settings" description="View and manage site contact/info settings">
        {onEdit ? (
          <Button variant="primary" onClick={onEdit}>Edit Settings</Button>
        ) : (
          <Link to="/settings/form"><Button variant="primary">Edit Settings</Button></Link>
        )}
        <Button className="ml-3" variant="danger" onClick={onDelete} disabled={deleting}>
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </PageHeader>

      <main className="w-full px-4 pb-24">
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            Loading settings…
          </div>
        )}

        {!loading && error && (
          <div className="text-center text-red-600">{error}</div>
        )}

        {!loading && !error && !data && (
          <div className="text-center text-brand-600">No settings found. Click Edit to create.</div>
        )}

        {!loading && !error && data && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Row label="Site Name" value={data.siteName || data.site_name} />
                <Row label="Email" value={data.email} />
                <Row label="Phone" value={data.phone} />
                <Row label="Address" value={data.address} />
              </div>
              <div>
                <Row label="Facebook" value={data?.socials?.facebook || data.facebook} />
                <Row label="WhatsApp" value={data?.socials?.whatsapp || data.whatsapp} />
                <Row label="Instagram" value={data?.socials?.instagram || data.instagram} />
                <Row label="Twitter" value={data?.socials?.twitter || data.twitter} />
                <Row label="LinkedIn" value={data?.socials?.linkedin || data.linkedin} />
              </div>
            </div>
          </div>
        )}
      </main>
    </PageLayout>
  );
}
