// service form for creating/editing a service
import React, { useState, useEffect, useMemo } from "react";
import AdminForm from "../../components/ui/AdminForm";
import FileUpload from "../../components/ui/FileUpload";
import { useServicesStore } from "../../stores/useServicesStore"; // named import

const INITIAL_STATE = {
  title: "",
  description: "",
  link: "",
  image: null, // File | URL string | null
};

export default function ServiceForm({ serviceId, onSuccess }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(Boolean(serviceId));
  const [saving, setSaving] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [serverError, setServerError] = useState("");

  // Select each item separately (avoid returning a new object each render)
  const createService      = useServicesStore((s) => s.createService);
  const updateService      = useServicesStore((s) => s.updateService);
  const fetchServiceById   = useServicesStore((s) => s.fetchServiceById);

  useEffect(() => {
    if (!serviceId) return;
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        setServerError("");

        // ⚠️ Your store's fetchServiceById calls axios.get(API_ROOT, config)
        // so we must pass a config object with params + headers.
        const token = localStorage.getItem("access_token");
        const data = await fetchServiceById({
          params: { id: serviceId },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!isMounted) return;
        setFormData({
          title: data?.title ?? "",
          description: data?.description ?? "",
          link: data?.link ?? "",
          image: data?.image ?? null, // may be URL string
        });
      } catch (err) {
        console.error(err);
        if (isMounted) setServerError("Failed to load the service. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  const validateLink = (val) => {
    if (!val) {
      setLinkError("");
      return true; // optional
    }
    try {
      const u = new URL(val);
      if (!/^https?:$/.test(u.protocol)) throw new Error("Invalid protocol");
      setLinkError("");
      return true;
    } catch {
      setLinkError("Please enter a valid URL starting with http:// or https://");
      return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "link") validateLink(value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files?.[0] || null }));
  };

  // Build payload for your JSON-only store:
  // - If image is a File, we drop it (store is JSON-only with content-type app/json).
  // - If image is a URL string, we include it.
  const payload = useMemo(() => {
    const isFile = formData.image instanceof File;
    return {
      title: formData.title?.trim(),
      description: formData.description?.trim(),
      link: formData.link?.trim() || null,
      ...(typeof formData.image === "string" && !isFile ? { image: formData.image } : {}),
    };
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validateLink(formData.link)) return;
    if (saving) return;

    try {
      setSaving(true);

      if (serviceId) {
        // ⚠️ Your store's updateService PATCHes the collection URL,
        // so send id in the body.
        await updateService({ id: serviceId, ...payload });
      } else {
        await createService(payload);
      }

      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || "Error saving service. Please try again.";
      setServerError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => onSuccess && onSuccess();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto" />
        <p className="mt-2 text-gray-600 dark:text-gray-300">Loading service...</p>
      </div>
    );
  }

  return (
    <AdminForm
      title={serviceId ? "Edit Service" : "Add New Service"}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitText={saving ? "Saving..." : serviceId ? "Update Service" : "Create Service"}
      submitDisabled={saving || !!linkError}
    >
      {!!serverError && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-300">
          {serverError}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Service Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          autoComplete="off"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
      </div>

      {/* Link (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Link (optional)
        </label>
        <input
          type="url"
          name="link"
          value={formData.link}
          onChange={handleInputChange}
          placeholder="https://example.com/service"
          className={`${
            linkError ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-brand-500"
          } w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
          inputMode="url"
          pattern="https?://.*"
        />
        {linkError && <p className="mt-1 text-xs text-red-600">{linkError}</p>}
      </div>

      {/* Image */}
      <div>
        <FileUpload
          label="Service Image"
          name="image"
          value={formData.image}
          onChange={handleFileChange}
          accept="image/*"
        />
        {typeof formData.image === "string" && (
          <img
            src={formData.image}
            alt="Current service"
            className="mt-2 h-16 w-16 rounded object-cover border border-gray-200 dark:border-gray-700"
          />
        )}
        {/* Note: Your store is JSON-only; newly picked File objects are ignored on submit. */}
      </div>
    </AdminForm>
  );
}
