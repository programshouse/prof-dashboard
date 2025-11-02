import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import AdminForm from "../../components/ui/AdminForm";
import { useServicesStore } from "../../stores/useServicesStore";

const getId = (x) => x?.id ?? x?._id ?? x?.uuid ?? null;

const ALLOWED_IMAGE_MIME = new Set([
  "image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif",
]);
const ALLOWED_IMAGE_EXT = new Set(["png", "jpg", "jpeg", "webp", "svg", "gif"]);
const getExt = (name = "") => name.split(".").pop()?.toLowerCase() || "";

export default function ServiceForm({ serviceId: propServiceId, onSuccess }) {
  const [search] = useSearchParams();
  const qsId = search.get("id");
  const isReadOnly = search.get("readonly") === "1" || search.get("mode") === "view";
  const serviceId = getId({ id: propServiceId ?? qsId });

  const [form, setForm] = useState({
    title: "",
    description: "",
    link: "",
    imageFile: null,       // File only
    imageExistingUrl: "",  // when editing, show existing image
  });
  const [loading, setLoading] = useState(Boolean(serviceId));
  const [saving, setSaving] = useState(false);
  const [linkErr, setLinkErr] = useState("");
  const [imgErr, setImgErr] = useState("");
  const [serverErr, setServerErr] = useState("");

  const fetchServiceById = useServicesStore((s) => s.fetchServiceById);
  const createService    = useServicesStore((s) => s.createService);
  const updateService    = useServicesStore((s) => s.updateService);

  const blobs = useRef({ img: null });
  const revoke = () => { if (blobs.current.img) { URL.revokeObjectURL(blobs.current.img); blobs.current.img = null; } };

  // Load existing
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!serviceId) return;
      try {
        setLoading(true);
        setServerErr("");
        const data = await fetchServiceById(serviceId);
        if (!mounted) return;

        setForm((p) => ({
          ...p,
          title: data?.title ?? "",
          description: data?.description ?? "",
          link: data?.link ?? "",
          imageExistingUrl: typeof data?.image === "string" ? data.image : "",
          imageFile: null,
        }));
      } catch (e) {
        console.error(e);
        if (mounted) setServerErr("Failed to load service. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => revoke();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  // Previews
  const imgPreview = useMemo(() => {
    if (form.imageFile instanceof File) {
      revoke();
      const u = URL.createObjectURL(form.imageFile);
      blobs.current.img = u;
      return u;
    }
    return form.imageExistingUrl || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.imageFile, form.imageExistingUrl]);

  // Validation
  const validateLink = (val) => {
    if (!val) { setLinkErr(""); return true; }
    try {
      const u = new URL(val);
      if (!/^https?:$/i.test(u.protocol)) throw new Error("bad");
      setLinkErr("");
      return true;
    } catch {
      setLinkErr("Please enter a valid URL starting with http:// or https://");
      return false;
    }
  };

  // Handlers
  const onText = (e) => {
    const { name, value } = e.target;
    if (name === "link") validateLink(value);
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onPickImg = (e) => {
    const f = e.target.files?.[0] || null;
    if (!f) { setImgErr(""); setForm(p => ({ ...p, imageFile: null })); return; }

    const ext = getExt(f.name);
    const okByType = ALLOWED_IMAGE_MIME.has(f.type);
    const okByExt  = ALLOWED_IMAGE_EXT.has(ext);

    if (!okByType && !okByExt) {
      setImgErr("Image must be PNG, JPG/JPEG, WEBP, SVG, or GIF.");
      e.target.value = "";
      return;
    }
    setImgErr("");
    setForm((p) => ({ ...p, imageFile: f }));
  };

  const clearImg = () => { setForm((p) => ({ ...p, imageFile: null })); revoke(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) { onSuccess && onSuccess(); return; }
    if (saving || linkErr || imgErr) return;
    if (!form.title.trim() || !form.description.trim()) return;

    try {
      setSaving(true);
      setServerErr("");

      // Pass a plain object; store will convert to FormData because imageFile is a File.
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        link: form.link?.trim() || "",
        ...(form.imageFile instanceof File ? { image: form.imageFile } : {}), // key: "image" as expected by backend
      };

      if (serviceId) await updateService(serviceId, body);
      else await createService(body);

      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || "Error saving service.";
      setServerErr(msg);
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

  return (
    <PageLayout title={`${isReadOnly ? "View" : serviceId ? "Edit" : "Add"} Service | ProfMSE`}>
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
              isReadOnly ? "Close" : saving ? "Saving..." : serviceId ? "Update Service" : "Create Service"
            }
            submitDisabled={isReadOnly ? false : saving || !!linkErr || !!imgErr}
          >
            {!!serverErr && (
              <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-300">
                {serverErr}
              </div>
            )}

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Service Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={onText}
                className={`${inputCls} ${disabledCls}`}
                required
                disabled={disabled}
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onText}
                rows={4}
                className={`${inputCls} ${disabledCls}`}
                required
                disabled={disabled}
              />
            </div>

            {/* Link (optional) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Link (optional)</label>
              <input
                type="url"
                name="link"
                value={form.link}
                onChange={onText}
                placeholder="https://example.com/service"
                className={`${inputCls} ${disabled ? "border-gray-200 dark:border-gray-700" : linkErr ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-brand-500"}`}
                inputMode="url"
                pattern="https?://.*"
                disabled={disabled}
              />
              {linkErr && <p className="mt-1 text-xs text-red-600">{linkErr}</p>}
            </div>

            {/* Image File */}
            <div className={isReadOnly ? "opacity-60 pointer-events-none" : ""}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image (PNG/JPG/JPEG/WEBP/SVG/GIF)
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                onChange={onPickImg}
                className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-brand-600 file:text-white hover:file:bg-brand-700"
                disabled={isReadOnly}
              />
              {imgErr && <p className="mt-1 text-xs text-red-600">{imgErr}</p>}

              {imgPreview && (
                <div className="mt-2">
                  <img
                    src={imgPreview}
                    alt="Preview"
                    className="h-16 w-16 rounded object-cover border border-gray-200 dark:border-gray-700"
                    onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                  />
                  {!isReadOnly && form.imageFile && (
                    <button
                      type="button"
                      onClick={clearImg}
                      className="mt-2 block text-xs text-red-600 hover:underline"
                    >
                      Remove selected image
                    </button>
                  )}
                </div>
              )}
            </div>
          </AdminForm>
        )}
      </div>
    </PageLayout>
  );
}
