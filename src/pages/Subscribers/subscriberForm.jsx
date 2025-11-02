// /src/pages/Subscribers/subscriberForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import AdminForm from "../../components/ui/AdminForm";
import { useSubscribersStore } from "../../stores/useSubscribersStore";

const INITIAL = { email: "", name: "" };

export default function SubscriberForm({ subscriberId, initialValues, onSuccess }) {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(Boolean(subscriberId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const createSubscriber = useSubscribersStore((s) => s.createSubscriber);
  const updateSubscriber = useSubscribersStore((s) => s.updateSubscriber);
  const fetchSubscriberById = useSubscribersStore((s) => s.fetchSubscriberById);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!subscriberId) {
        if (initialValues) setForm({ email: initialValues.email || "", name: initialValues.name || "" });
        setLoading(false);
        return;
      }
      try {
        setLoading(true); setError("");
        const data = await fetchSubscriberById(subscriberId);
        if (!mounted) return;
        setForm({ email: data?.email || "", name: data?.name || data?.fullName || "" });
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || "Failed to load subscriber");
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [subscriberId, initialValues, fetchSubscriberById]);

  const emailValid = useMemo(() => /.+@.+\..+/.test(form.email.trim()), [form.email]);
  const disabled = saving || !emailValid || !form.email.trim();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    try {
      setSaving(true); setError("");
      const body = { email: form.email.trim(), ...(form.name?.trim() ? { name: form.name.trim() } : {}) };
      if (subscriberId) await updateSubscriber(subscriberId, body);
      else await createSubscriber(body);
      onSuccess && onSuccess();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save subscriber");
    } finally { setSaving(false); }
  };

  const cancel = () => onSuccess && onSuccess();

  return (
    <PageLayout title={subscriberId ? "Edit Subscriber | ProfMSE" : "Add Subscriber | ProfMSE"}>
      {/* 1400px fixed-width wrapper for EVERYTHING */}
      <div className="mx-auto w-[1400px] max-w-[1400px]">
        <PageHeader title={subscriberId ? "Edit Subscriber" : "Add Subscriber"} />
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            Loading…
          </div>
        ) : (
          <AdminForm
            title="Subscriber"
            onSubmit={submit}
            onCancel={cancel}
            submitText={saving ? "Saving…" : subscriberId ? "Update" : "Create"}
          >
            {!!error && (
              <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-300">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              {!emailValid && form.email && (
                <p className="mt-1 text-xs text-red-600">Enter a valid email.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name (optional)</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </AdminForm>
        )}
      </div>
    </PageLayout>
  );
}
