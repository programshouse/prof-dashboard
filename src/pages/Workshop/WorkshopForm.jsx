// /src/pages/Profile/ProfileForm.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import AdminForm from "../../components/ui/AdminForm";
import Button from "../../components/ui/button/Button";
import { useWhoAmIStore } from "../../stores/useWhoAmIStore";

/* ---------- URL helper (same approach as Workshops) ---------- */
const ORIGIN = "https://www.programshouse.com";
const toAbsolute = (path) => {
  if (!path) return "";
  if (/^(https?:|data:|\/\/)/i.test(path)) return path; // absolute already
  if (path.startsWith("/")) return `${ORIGIN}${path}`;  // server-relative
  return `${ORIGIN}/storage/${path}`;                   // bare filename
};

/* ---------- Image validation & helpers (match Workshops style) ---------- */
const ALLOWED_IMAGE_MIME = new Set([
  "image/png",
  "image/jpeg",       // jpg + jpeg
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);
const ALLOWED_IMAGE_EXT = new Set(["png", "jpg", "jpeg", "webp", "svg", "gif"]);
const getExt = (name = "") => name.split(".").pop()?.toLowerCase() || "";

/* ---------- Limits ---------- */
const MAX_TITLE = 80;
const MAX_DESC = 600;
const MAX_FEATURES = 12;

/* ---------- Initial state ---------- */
const INITIAL = {
  id: null,
  title: "",
  description: "",
  features: [],
  // files (new picks)
  imageFile: null,
  videoFile: null,
  // existing media URLs (from API) for preview
  imgExistingUrl: "",
  vidExistingUrl: "",
};

export default function ProfileForm({ onSuccess }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isReadOnly =
    searchParams.get("readonly") === "1" || searchParams.get("mode") === "view";

  const fetchAll = useWhoAmIStore((s) => s.fetchAll);
  const create   = useWhoAmIStore((s) => s.create);
  const update   = useWhoAmIStore((s) => s.update);
  const destroy  = useWhoAmIStore((s) => s.delete ?? s.remove ?? s.deleteOne ?? s.destroy);

  const [form, setForm]       = useState(INITIAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState("");

  // client-side field errors (like Workshops)
  const [imgErr, setImgErr]     = useState("");
  const [videoErr, setVideoErr] = useState("");

  // keep & clean blob URLs
  const blobs = useRef({ img: null, vid: null });
  const revoke = (k) => { if (blobs.current[k]) { URL.revokeObjectURL(blobs.current[k]); blobs.current[k] = null; } };

  /* ---------- Load first who-am-i record (like your previous logic) ---------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await fetchAll();
        const first = Array.isArray(list) && list.length ? list[0] : null;

        // Try multiple common API shapes for media
        const imgVal =
          first?.image_path ?? first?.img_path ?? first?.image ?? first?.img ?? "";
        const vidVal =
          first?.video_path ?? first?.video ?? "";

        setForm({
          id: first?.id ?? first?._id ?? null,
          title: first?.title || "",
          description: first?.description || "",
          features: Array.isArray(first?.features) ? first.features : [],
          imageFile: null,
          videoFile: null,
          imgExistingUrl: imgVal || "",
          vidExistingUrl: vidVal || "",
        });
      } catch (e) {
        console.error(e);
        setErr("Couldn't load profile. Try again.");
      } finally {
        setLoading(false);
      }
    })();
    return () => { revoke("img"); revoke("vid"); };
  }, [fetchAll]);

  /* ---------- Previews (prefer chosen file; else existing URL) ---------- */
  const imgPreview = useMemo(() => {
    if (form.imageFile instanceof File) {
      revoke("img");
      const u = URL.createObjectURL(form.imageFile);
      blobs.current.img = u;
      return u;
    }
    return toAbsolute(form.imgExistingUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.imageFile, form.imgExistingUrl]);

  const vidPreview = useMemo(() => {
    if (form.videoFile instanceof File) {
      revoke("vid");
      const u = URL.createObjectURL(form.videoFile);
      blobs.current.vid = u;
      return u;
    }
    return toAbsolute(form.vidExistingUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.videoFile, form.vidExistingUrl]);

  /* ---------- Text handlers ---------- */
  const onText = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  /* ---------- Features handlers ---------- */
  const addFeature = (val) => {
    if (!val) return;
    setForm((p) => {
      const next = [...(p.features || [])];
      if (next.length >= MAX_FEATURES) return p;
      next.push(val);
      return { ...p, features: next };
    });
  };

  const updateFeature = (i, value) => {
    setForm((p) => ({
      ...p,
      features: p.features.map((f, idx) => (idx === i ? value : f)),
    }));
  };

  const moveFeature = (i, dir) => {
    setForm((p) => {
      const arr = [...p.features];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return p;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...p, features: arr };
    });
  };

  const removeFeature = (i) =>
    setForm((p) => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }));

  /* ---------- File pickers (match Workshops) ---------- */
  const onPickImage = (e) => {
    const f = e.target.files?.[0] || null;
    if (!f) { setImgErr(""); setForm((p) => ({ ...p, imageFile: null })); return; }

    const ext  = getExt(f.name);
    const okByType = ALLOWED_IMAGE_MIME.has(f.type);
    const okByExt  = ALLOWED_IMAGE_EXT.has(ext);

    if (!okByType && !okByExt) {
      setImgErr("Image must be PNG, JPG/JPEG, WEBP, SVG, or GIF.");
      e.target.value = ""; // reset input
      return;
    }
    setImgErr("");
    setForm((p) => ({ ...p, imageFile: f, videoFile: null })); // mutually exclusive (like your prior UI)
  };

  const onPickVideo = (e) => {
    const f = e.target.files?.[0] || null;
    if (!f) { setVideoErr(""); setForm((p) => ({ ...p, videoFile: null })); return; }

    const ext = getExt(f.name);
    const isVideo = f.type?.startsWith("video/") || ["mp4","mov","m4v","webm","mkv","avi","wmv","flv","mpeg","mpg","3gp","ogg","ogv"].includes(ext);
    if (!isVideo) {
      setVideoErr("Please choose a valid video file.");
      e.target.value = "";
      return;
    }
    setVideoErr("");
    setForm((p) => ({ ...p, videoFile: f, imageFile: null })); // mutually exclusive
  };

  const clearImage = () => { setForm((p) => ({ ...p, imageFile: null })); revoke("img"); };
  const clearVideo = () => { setForm((p) => ({ ...p, videoFile: null })); revoke("vid"); };

  /* ---------- Validations ---------- */
  const vErrs = useMemo(() => {
    const m = {};
    if (!form.title.trim()) m.title = "Required";
    if (form.title.length > MAX_TITLE) m.title = `Max ${MAX_TITLE} chars`;
    if (!form.description.trim()) m.description = "Required";
    if (form.description.length > MAX_DESC) m.description = `Max ${MAX_DESC} chars`;
    if ((form.features || []).length > MAX_FEATURES) m.features = `Max ${MAX_FEATURES}`;
    return m;
  }, [form]);

  const disabledSubmit = useMemo(() => {
    const hasFieldErrs = Object.keys(vErrs).length > 0 || !!imgErr || !!videoErr;
    if (isReadOnly) return false;
    if (saving || hasFieldErrs) return true;
    // (Optionally: add deep equality check with original values if you want to disable when unchanged)
    return false;
  }, [isReadOnly, saving, vErrs, imgErr, videoErr]);

  /* ---------- Submit: always FormData; keys: image + video ---------- */
  const submit = async (e) => {
    e.preventDefault();
    if (isReadOnly) { onSuccess && onSuccess(); return; }
    if (disabledSubmit) return;

    try {
      setSaving(true);
      setErr("");

      const fd = new FormData();
      fd.append("title",       form.title.trim());
      fd.append("description", form.description.trim());

      // features[] (Laravel-friendly)
      (form.features || []).forEach((feat) => fd.append("features[]", feat));

      // media: send ONLY if a new file is chosen
      if (form.imageFile instanceof File) fd.append("image", form.imageFile);
      if (form.videoFile instanceof File) fd.append("video", form.videoFile);

      if (form.id) await update(form.id, fd);
      else         await create(fd);

      onSuccess && onSuccess();
    } catch (e2) {
      console.error(e2);
      setErr(e2?.response?.data?.message || "Error saving profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Profile Management | ProfMSE">
        <div className="mx-auto w-[1400px] max-w-[1400px] px-4">
          <PageHeader title="Profile Management" description="Edit your professional profile information" />
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto" />
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading…</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const inputCls =
    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white";
  const disabledCls = isReadOnly
    ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed border-gray-200 dark:border-gray-700"
    : "border-gray-300";

  return (
    <PageLayout title={`${isReadOnly ? "View" : form.id ? "Edit" : "Add"} Profile | ProfMSE`}>
      <div className="mx-auto w-[1400px] max-w-[1400px] px-4">
        <PageHeader
          title={`${isReadOnly ? "View" : form.id ? "Edit" : "Add"} Profile`}
          description="Keep your professional profile clear and up to date."
        >
          {!!form?.id && !isReadOnly && (
            <Button
              variant="danger"
              onClick={async () => {
                if (!destroy) return alert("Delete is not wired in the store.");
                if (!window.confirm("Delete this profile?")) return;
                try { setSaving(true); await destroy(form.id); onSuccess ? onSuccess() : navigate("/profile/list"); }
                finally { setSaving(false); }
              }}
              disabled={saving}
              className="mr-3"
            >
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
            submitText={isReadOnly ? "Close" : saving ? "Saving…" : form.id ? "Update Profile" : "Create Profile"}
            submitDisabled={disabledSubmit}
          >
            {/* Title + Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={onText}
                  maxLength={MAX_TITLE}
                  className={`${inputCls} ${disabledCls}`}
                  required
                  disabled={isReadOnly}
                  placeholder="e.g., Dr. Jane Doe"
                />
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-gray-500">Professional display name.</span>
                  <span className="text-gray-400">{form.title.length}/{MAX_TITLE}</span>
                </div>
                {vErrs.title && <p className="text-xs text-red-600 mt-1">{vErrs.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Professional Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onText}
                  rows={5}
                  maxLength={MAX_DESC}
                  className={`${inputCls} ${disabledCls}`}
                  required
                  disabled={isReadOnly}
                  placeholder="Brief summary of expertise and outcomes."
                />
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-gray-500">Keep it concise and specific.</span>
                  <span className="text-gray-400">{form.description.length}/{MAX_DESC}</span>
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
                {(form.features || []).map((feature, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Feature #{i + 1}</span>
                      {!isReadOnly && (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => moveFeature(i, -1)}
                            className="px-2 py-1 text-xs rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white" title="Move up">↑</button>
                          <button type="button" onClick={() => moveFeature(i, +1)}
                            className="px-2 py-1 text-xs rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white" title="Move down">↓</button>
                          <button type="button" onClick={() => removeFeature(i)}
                            className="px-2 py-1 text-xs rounded-md bg-red-500 text-white hover:bg-red-600" title="Remove">Remove</button>
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
                      onChange={(e) => setForm((p) => ({ ...p, newFeatureDraft: e.target.value }))}
                      value={form.newFeatureDraft || ""}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = (form.newFeatureDraft || "").trim();
                        if (!val || (form.features || []).length >= MAX_FEATURES) return;
                        addFeature(val);
                        setForm((p) => ({ ...p, newFeatureDraft: "" }));
                      }}
                      className="absolute right-2 bottom-2 px-6 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-sm"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}

              {vErrs.features && <p className="text-xs text-red-600 mt-2">{vErrs.features}</p>}
            </div>

            {/* Media (FILES ONLY, same as Workshops) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Image */}
              <div className={isReadOnly ? "opacity-60 pointer-events-none" : ""}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image (PNG/JPG/WEBP/SVG/GIF)
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                  onChange={onPickImage}
                  className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-brand-600 file:text-white hover:file:bg-brand-700"
                  disabled={isReadOnly}
                />
                {imgErr && <p className="mt-1 text-xs text-red-600">{imgErr}</p>}
                {imgPreview && (
                  <div className="mt-2">
                    <img
                      src={imgPreview}
                      alt="Profile"
                      className="h-32 w-32 rounded object-cover border border-gray-200 dark:border-gray-700"
                    />
                    {!isReadOnly && form.imageFile && (
                      <button
                        type="button"
                        onClick={clearImage}
                        className="mt-2 block text-xs text-red-600 hover:underline"
                      >
                        Remove selected image
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Video */}
              <div className={isReadOnly ? "opacity-60 pointer-events-none" : ""}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video (any video/*)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={onPickVideo}
                  className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-brand-600 file:text-white hover:file:bg-brand-700"
                  disabled={isReadOnly}
                />
                {videoErr && <p className="mt-1 text-xs text-red-600">{videoErr}</p>}
                {vidPreview && (
                  <div className="mt-2">
                    <video
                      src={vidPreview}
                      controls
                      className="w-full max-h-48 rounded border border-gray-200 dark:border-gray-700"
                    />
                    {!isReadOnly && form.videoFile && (
                      <button
                        type="button"
                        onClick={clearVideo}
                        className="mt-2 text-xs text-red-600 hover:underline"
                      >
                        Remove selected video
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
