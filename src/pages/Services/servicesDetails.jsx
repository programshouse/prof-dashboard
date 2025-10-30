// /src/pages/Services/ServiceDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/button/Button";
import Toaster, { notify } from "../../components/ui/Toaster/Toaster";
import { useServicesStore } from "../../stores/useServicesStore";

// Build absolute URLs when API returns relative image paths
const makeImageUrl = (path) => {
  if (!path) return null;
  if (/^(https?:|data:|\/\/)/i.test(path)) return path;
  return `https://www.programshouse.com${path.startsWith("/") ? path : `/${path}`}`;
};

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchServiceById = useServicesStore((s) => s.fetchServiceById);
  const updateService    = useServicesStore((s) => s.updateService);   // updateService(id, body)
  const deleteService    = useServicesStore((s) => s.deleteService);   // deleteService(id)

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [editMode, setEditMode] = useState(false);

  // local copy for show/edit
  const [svc, setSvc] = useState(null);

  // form state (prefilled when toggling to edit mode)
  const [form, setForm] = useState({
    title: "",
    description: "",
    link: "",
    image: "", // URL string (JSON-only version)
  });
  const [linkError, setLinkError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Missing service id");
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchServiceById(id);
        if (!mounted) return;
        setSvc(data || null);
        // seed form so switching to edit is instant
        setForm({
          title: data?.title ?? "",
          description: data?.description ?? "",
          link: data?.link ?? "",
          image: typeof data?.image === "string" ? data.image : "",
        });
      } catch (e) {
        console.error(e);
        if (mounted) setError(e?.response?.data?.message || "Failed to load service");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [id, fetchServiceById]);

  const imageUrl = useMemo(() => makeImageUrl(svc?.image || ""), [svc]);

  const validateLink = (val) => {
    if (!val) { setLinkError(""); return true; }
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

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "link") validateLink(value);
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!id) return setError("Missing service id");
    if (!validateLink(form.link)) return;

    try {
      setSaving(true);
      // IMPORTANT: pass id separately; do NOT include it in body
      const body = {
        title: form.title?.trim(),
        description: form.description?.trim(),
        link: form.link?.trim() || null,
        ...(form.image ? { image: form.image } : {}), // JSON-only preview
      };
      const updated = await updateService(id, body);
      setSvc(updated);
      notify.action("update").success("Service updated");
      setEditMode(false);
    } catch (e) {
      console.error(e);
      notify.action("update").error(e?.response?.data?.message || "Failed to update service");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!id) return setError("Missing service id");
    if (!window.confirm("Delete this service? This cannot be undone.")) return;
    try {
      await deleteService(id); // pass id directly
      notify.action("delete").success("Service deleted");
      navigate("/services");
    } catch (e) {
      console.error(e);
      notify.action("delete").error(e?.response?.data?.message || "Failed to delete service");
    }
  };

  if (loading) {
    return (
      <PageLayout title="Service Details | ProfMSE">
        <PageHeader title="Service Details" description="View and edit a service" />
        <div className="mx-auto max-w-3xl px-4">
          <div className="h-64 rounded-lg border bg-white dark:bg-gray-800 animate-pulse" />
        </div>
      </PageLayout>
    );
  }

  if (error || !svc) {
    return (
      <PageLayout title="Service Details | ProfMSE">
        <PageHeader title="Service Details" description="View and edit a service">
          <Link to="/services"><Button variant="secondary">← Back to list</Button></Link>
        </PageHeader>
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-300">
            {error || "Service not found"}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`${svc?.title || "Service"} | ProfMSE`}>
      <Toaster position="bottom-right" />

      <PageHeader
        title={svc?.title || "Service Details"}
        description="View and edit a service"
      >
        <div className="flex gap-2">
          <Link to="/services"><Button variant="secondary">← Back</Button></Link>
          {!editMode ? (
            <>
              <Button onClick={() => setEditMode(true)} variant="primary">Edit</Button>
              <Button onClick={onDelete} variant="danger">Delete</Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(false)} variant="secondary">Cancel</Button>
          )}
        </div>
      </PageHeader>

      <main className="mx-auto max-w-3xl px-4 pb-24">
        {!editMode ? (
          <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Image */}
            <div className="w-full h-64 bg-gray-50 dark:bg-gray-700">
              {imageUrl ? (
                <img src={imageUrl} alt={svc?.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{svc?.title}</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {svc?.description || "—"}
              </p>

              {svc?.link && (
                <p className="pt-2">
                  <a
                    className="text-brand-600 hover:underline break-all"
                    href={svc.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {svc.link}
                  </a>
                </p>
              )}
            </div>
          </article>
        ) : (
          <form
            onSubmit={onSave}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-5"
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={onChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                rows={5}
                value={form.description}
                onChange={onChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                value={form.link}
                onChange={onChange}
                placeholder="https://example.com/service"
                className={`${
                  linkError ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-brand-500"
                } w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                inputMode="url"
                pattern="https?://.*"
              />
              {linkError && <p className="mt-1 text-xs text-red-600">{linkError}</p>}
            </div>

            {/* Image URL (JSON-only version) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image URL (optional)
              </label>
              <input
                type="url"
                name="image"
                value={form.image}
                onChange={onChange}
                placeholder="https://www.programshouse.com/uploads/service.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {!!form.image && (
                <img
                  src={makeImageUrl(form.image)}
                  alt="Preview"
                  className="mt-2 h-16 w-16 rounded object-cover border border-gray-200 dark:border-gray-700"
                />
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" variant="primary" disabled={saving || !!linkError}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </main>
    </PageLayout>
  );
}
