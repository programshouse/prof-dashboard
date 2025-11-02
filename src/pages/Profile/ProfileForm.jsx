// /src/pages/Profile/ProfileForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import AdminForm from "../../components/ui/AdminForm";
import Button from "../../components/ui/button/Button";
import FileUpload from "../../components/ui/FileUpload";
import { useWhoAmIStore } from "../../stores/useWhoAmIStore";

const MAX_TITLE = 80, MAX_DESC = 600, MAX_FEATURES = 12;

export default function ProfileForm({ onSuccess }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isReadOnly =
    searchParams.get("readonly") === "1" || searchParams.get("mode") === "view";

  const fetchAll = useWhoAmIStore((s) => s.fetchAll);
  const create   = useWhoAmIStore((s) => s.create);
  const update   = useWhoAmIStore((s) => s.update);
  // try to pick a delete fn if your store has it under any common name
  const destroy  = useWhoAmIStore(
    (s) => s.delete ?? s.remove ?? s.deleteOne ?? s.destroy
  );

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  const [profileData, setProfileData] = useState({
    id: null, title: "", description: "", features: [], image: null, video: null
  });

  const [formData, setFormData] = useState({
    title: "", description: "", features: [], image: null, video: null, newFeatureDraft: ""
  });

  // ---- load first whoami record as the profile
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await fetchAll();
        const first = Array.isArray(list) && list.length ? list[0] : null;
        const clean = {
          id: first?.id ?? first?._id ?? null,
          title: first?.title || "",
          description: first?.description || "",
          features: Array.isArray(first?.features) ? first.features : [],
          image: first?.image || null,
          video: first?.video || null,
        };
        setProfileData(clean);
        setFormData({ ...clean, newFeatureDraft: "" });
      } catch {
        setErr("Couldn't load profile. Try again.");
      } finally { setLoading(false); }
    })();
  }, [fetchAll]);

  // ---- handlers
  const onText = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const addFeature = (val) => {
    setFormData((p) => {
      const next = [...(p.features || [])];
      if (next.length >= MAX_FEATURES) return p;
      next.push(val ?? "");
      return { ...p, features: next };
    });
  };

  const updateFeature = (i, value) => {
    setFormData((p) => ({
      ...p,
      features: p.features.map((f, idx) => (idx === i ? value : f))
    }));
  };

  const moveFeature = (i, dir) => {
    setFormData((p) => {
      const arr = [...p.features];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return p;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...p, features: arr };
    });
  };

  const removeFeature = (i) =>
    setFormData((p) => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }));

  const onFile = (e) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;
    if (isReadOnly) return;
    if (name === "image") setFormData((p) => ({ ...p, image: file, video: null }));
    if (name === "video") setFormData((p) => ({ ...p, video: file, image: null }));
  };

  const clearMedia = (k) => !isReadOnly && setFormData((p) => ({ ...p, [k]: null }));

  // ---- validation
  const vErrs = useMemo(() => {
    const m = {};
    if (!formData.title.trim()) m.title = "Required";
    if (formData.title.length > MAX_TITLE) m.title = `Max ${MAX_TITLE} chars`;
    if (!formData.description.trim()) m.description = "Required";
    if (formData.description.length > MAX_DESC) m.description = `Max ${MAX_DESC} chars`;
    if ((formData.features || []).length > MAX_FEATURES) m.features = `Max ${MAX_FEATURES}`;
    return m;
  }, [formData]);

  const disabled = useMemo(() => {
    const a = profileData, b = formData;
    const same =
      a.title === b.title &&
      a.description === b.description &&
      JSON.stringify(a.features) === JSON.stringify(b.features) &&
      (!!a.image === !!b.image) &&
      (!!a.video === !!b.video);
    return isReadOnly ? false : (saving || Object.keys(vErrs).length > 0 || same);
  }, [profileData, formData, vErrs, saving, isReadOnly]);

  // ---- submit (JSON-only)
  const isFile = (x) => typeof File !== "undefined" && x instanceof File;

  const submit = async (e) => {
    e.preventDefault();
    if (isReadOnly) { onSuccess && onSuccess(); return; }
    if (disabled) return;
    try {
      setSaving(true); setErr("");
      const body = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        features: formData.features || [],
        ...(typeof formData.image === "string" ? { image: formData.image } : {}),
        ...(typeof formData.video === "string" ? { video: formData.video } : {}),
      };
      if (profileData?.id) {
        await update(profileData.id, body);
      } else {
        const created = await create(body);
        if (created?.id || created?._id) {
          const id = created.id ?? created._id;
          setProfileData((p) => ({ ...p, id }));
        }
      }
      setProfileData((p) => ({ ...p, ...body }));
      onSuccess && onSuccess();
    } catch {
      setErr("Update failed. Please retry.");
    } finally { setSaving(false); }
  };

  const doDelete = async () => {
    if (!destroy || !profileData?.id) {
      alert("Delete is not wired in the store yet.");
      return;
    }
    if (!window.confirm("Delete this profile?")) return;
    try {
      setSaving(true);
      await destroy(profileData.id);
      setProfileData({ id: null, title: "", description: "", features: [], image: null, video: null });
      setFormData({ title: "", description: "", features: [], image: null, video: null, newFeatureDraft: "" });
      onSuccess ? onSuccess() : navigate("/profile");
    } finally {
      setSaving(false);
    }
  };

  // ---- previews
  const imgURL = isFile(formData.image) ? URL.createObjectURL(formData.image) :
                 typeof formData.image === "string" ? formData.image : null;
  const vidURL = isFile(formData.video) ? URL.createObjectURL(formData.video) :
                 typeof formData.video === "string" ? formData.video : null;

  if (loading) {
    return (
      <PageLayout title="Profile Management | ProfMSE">
        <div className="mx-auto w-[1400px] max-w-[1400px] px-4">
          <PageHeader title="Profile Management" description="Edit your professional profile information" />
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading…</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`${isReadOnly ? "View" : "Edit"} Profile | ProfMSE`}>
      {/* Fixed-width wrapper */}
      <div className="mx-auto w-[1400px] max-w-[1400px] px-4">
        <PageHeader
          title={`${isReadOnly ? "View" : "Edit"} Profile`}
          description="Keep your professional profile clear and up to date."
        >
          {/* Top-left Add New (in header left is not built-in; we show useful actions on the right) */}
          {!!profileData?.id && !isReadOnly && (
            <Button variant="danger" onClick={doDelete} disabled={saving} className="mr-3">
              {saving ? "Deleting…" : "Delete"}
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate("/profile/list")} className="mr-3">
            Back to List
          </Button>
        </PageHeader>

        <div className="col-span-12 space-y-4">
          {err && (
            <div className="text-sm px-4 py-3 rounded bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
              {err}
            </div>
          )}

          <AdminForm
            title="Profile Information"
            onSubmit={submit}
            onCancel={() => (onSuccess ? onSuccess() : navigate("/profile/list"))}
            submitText={isReadOnly ? "Close" : saving ? "Saving…" : "Save Profile"}
            submitDisabled={disabled}
          >
            {/* Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={onText}
                  maxLength={MAX_TITLE}
                  placeholder="e.g., Dr. Jane Doe"
                  className={`mt-1 w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 ${
                    isReadOnly ? "border-gray-200 dark:border-gray-700 cursor-not-allowed" : "border-gray-300 dark:border-gray-600"
                  }`}
                  required
                  disabled={isReadOnly}
                />
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-gray-500">Professional display name.</span>
                  <span className="text-gray-400">{formData.title.length}/{MAX_TITLE}</span>
                </div>
                {vErrs.title && <p className="text-xs text-red-600 mt-1">{vErrs.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Professional Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={onText}
                  rows={5}
                  maxLength={MAX_DESC}
                  placeholder="Brief summary of expertise and outcomes."
                  className={`mt-1 w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 ${
                    isReadOnly ? "border-gray-200 dark:border-gray-700 cursor-not-allowed" : "border-gray-300 dark:border-gray-600"
                  }`}
                  required
                  disabled={isReadOnly}
                />
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-gray-500">Keep it concise and specific.</span>
                  <span className="text-gray-400">{formData.description.length}/{MAX_DESC}</span>
                </div>
                {vErrs.description && <p className="text-xs text-red-600 mt-1">{vErrs.description}</p>}
              </div>
            </div>

            {/* Features */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Professional Features
              </label>

              <div className="mt-3 space-y-4">
                {(formData.features || []).map((feature, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900/40"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Feature #{i + 1}</span>
                      {!isReadOnly && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveFeature(i, -1)}
                            className="px-2 py-1 text-xs rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                            title="Move up"
                          >↑</button>
                          <button
                            type="button"
                            onClick={() => moveFeature(i, +1)}
                            className="px-2 py-1 text-xs rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                            title="Move down"
                          >↓</button>
                          <button
                            type="button"
                            onClick={() => removeFeature(i)}
                            className="px-2 py-1 text-xs rounded-md bg-red-500 text-white hover:bg-red-600"
                            title="Remove"
                          >Remove</button>
                        </div>
                      )}
                    </div>
                    <textarea
                      value={feature}
                      onChange={(e) => updateFeature(i, e.target.value)}
                      rows={2}
                      placeholder="Write a detailed feature, responsibility, or achievement..."
                      className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 ${
                        isReadOnly ? "border-gray-200 dark:border-gray-700 cursor-not-allowed" : "border-gray-300 dark:border-gray-600"
                      }`}
                      disabled={isReadOnly}
                    />
                  </div>
                ))}
              </div>

              {!isReadOnly && (
                <div className="mt-5 flex items-center gap-2">
                  <div className="relative flex-1">
                    <textarea
                      id="new-feature"
                      rows={3}
                      placeholder="Add a new feature..."
                      className="w-full px-3 py-2 pr-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 resize-none"
                      value={formData.newFeatureDraft || ""}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, newFeatureDraft: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = (formData.newFeatureDraft || "").trim();
                        if (!val || (formData.features || []).length >= MAX_FEATURES) return;
                        addFeature(val);
                        setFormData((p) => ({ ...p, newFeatureDraft: "" }));
                      }}
                      className="absolute right-2 bottom-2 px-6 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-sm"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}

              {vErrs.features && (
                <p className="text-xs text-red-600 mt-2">{vErrs.features}</p>
              )}
            </div>

            {/* Media (image OR video) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className={formData.video ? "opacity-50 pointer-events-none" : ""}>
                <FileUpload label="Profile Image" name="image" value={formData.image} onChange={onFile} accept="image/*" disabled={isReadOnly} />
                {formData.image && (
                  <div className="mt-2 relative">
                    {imgURL ? <img src={imgURL} alt="preview" className="h-44 w-full object-cover rounded-lg border" /> : null}
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => clearMedia("image")}
                        className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-red-500 text-white"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className={formData.image ? "opacity-50 pointer-events-none" : ""}>
                <FileUpload label="Profile Video" name="video" value={formData.video} onChange={onFile} accept="video/*" disabled={isReadOnly} />
                {formData.video && (
                  <div className="mt-2 relative">
                    {vidURL ? <video src={vidURL} controls className="h-44 w-full rounded-lg border" /> : null}
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => clearMedia("video")}
                        className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-red-500 text-white"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </AdminForm>
        </div>
      </div>
    </PageLayout>
  );
}
