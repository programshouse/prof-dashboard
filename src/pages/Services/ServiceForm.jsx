import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import AdminForm from "../../components/ui/AdminForm";
import FileUpload from "../../components/ui/FileUpload";
import { useServicesStore } from "../../stores/useServicesStore";

// Allowed fields only (defensive)
const pickServicePayload = (o = {}) => {
  const isFile = typeof File !== "undefined" && o.image instanceof File;
  return {
    title: (o.title ?? "").trim(),
    description: (o.description ?? "").trim(),
    link: (o.link ?? "").trim() || null,
    ...(typeof o.image === "string" && !isFile ? { image: o.image } : {}),
  };
};

export default function ServiceForm({ serviceId: propServiceId, onSuccess }) {
  const [search] = useSearchParams();
  const qsId = search.get("id");
  const isReadOnly = search.get("readonly") === "1" || search.get("mode") === "view";
  const serviceId = propServiceId ?? qsId ?? null;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    image: null, // string URL | File | null
  });
  const [loading, setLoading] = useState(Boolean(serviceId));
  const [saving, setSaving] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [serverError, setServerError] = useState("");

  const fetchServiceById = useServicesStore((s) => s.fetchServiceById);
  const createService    = useServicesStore((s) => s.createService);
  const updateService    = useServicesStore((s) => s.updateService);

  // Load existing for edit/show
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!serviceId) return;
      try {
        setLoading(true);
        setServerError("");
        const data = await fetchServiceById(serviceId);

        if (!mounted) return;
        setFormData({
          title: data?.title ?? "",
          description: data?.description ?? "",
          link: data?.link ?? "",
          image: typeof data?.image === "string" ? data.image : null, // keep URL only
        });
      } catch (e) {
        console.error(e);
        if (mounted) setServerError("Failed to load service. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [serviceId, fetchServiceById]);

  // Validate link (optional)
  const validateLink = (val) => {
    if (!val) { setLinkError(""); return true; }
    try {
      const u = new URL(val);
      if (!/^https?:$/i.test(u.protocol)) throw new Error("bad protocol");
      setLinkError("");
      return true;
    } catch {
      setLinkError("Please enter a valid URL starting with http:// or https://");
      return false;
    }
  };

  // Inputs
  const onText = (e) => {
    const { name, value } = e.target;
    if (name === "link") validateLink(value);
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // FileUpload: accept either native event or direct value
  const onFile = (evtOrValue) => {
    if (evtOrValue?.target?.files) {
      const file = evtOrValue.target.files?.[0] || null;
      setFormData((p) => ({ ...p, image: file }));
      return;
    }
    // direct controlled value (string | File | null)
    setFormData((p) => ({ ...p, image: evtOrValue ?? null }));
  };

  const payload = useMemo(() => pickServicePayload(formData), [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) { onSuccess && onSuccess(); return; }
    if (!validateLink(formData.link) || saving) return;

    try {
      setSaving(true);
      setServerError("");

      if (serviceId) await updateService(serviceId, payload);
      else await createService(payload);

      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || "Error saving service. Please try again.";
      setServerError(msg);
    } finally {
      setSaving(false);
    }
  };

  const disabled = isReadOnly;
  const inputCls =
    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white";
  const disabledCls = disabled
    ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed border-gray-200 dark:border-gray-700"
    : "border-gray-300";

  // Safe preview: only show when it's a string URL
  const imagePreview =
    typeof formData.image === "string" ? formData.image : null;

  return (
    <PageLayout title={`${isReadOnly ? "View" : serviceId ? "Edit" : "Add"} Service | ProfMSE`}>
      {/* Fixed width like Settings (1400px) */}
      <div className="mx-auto w-[1400px] max-w-[1400px] px-4">
        <PageHeader title={`${isReadOnly ? "View" : serviceId ? "Edit" : "Add"} Service`} />

        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto" />
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading service...</p>
          </div>
        ) : (
          <AdminForm
            title="Service Information"
            onSubmit={handleSubmit}
            onCancel={onSuccess}
            submitText={
              isReadOnly ? "Close"
              : saving ? "Saving..."
              : serviceId ? "Update Service" : "Create Service"
            }
            submitDisabled={isReadOnly ? false : saving || !!linkError}
          >
            {!!serverError && (
              <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-300">
                {serverError}
              </div>
            )}

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service Title *
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={onText}
                className={`${inputCls} ${disabledCls}`}
                required
                disabled={disabled}
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onText}
                rows={4}
                className={`${inputCls} ${disabledCls}`}
                required
                disabled={disabled}
              />
            </div>

            {/* Link (optional) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Link (optional)
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={onText}
                placeholder="https://example.com/service"
                className={`${inputCls} ${disabled ? "border-gray-200 dark:border-gray-700" : linkError ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-brand-500"}`}
                inputMode="url"
                pattern="https?://.*"
                disabled={disabled}
              />
              {linkError && <p className="mt-1 text-xs text-red-600">{linkError}</p>}
            </div>

            {/* Image (JSON-only) */}
            <div className="mb-2">
              <FileUpload
                label="Service Image (URL or pick a file — file ignored by JSON store)"
                name="image"
                value={formData.image}
                onChange={onFile}
                accept="image/*"
                disabled={disabled}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-2 h-16 w-16 rounded object-cover border border-gray-200 dark:border-gray-700"
                />
              )}
            </div>
          </AdminForm>
        )}
      </div>
    </PageLayout>
  );
}
