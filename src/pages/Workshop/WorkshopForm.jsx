import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import AdminForm from "../../components/ui/AdminForm";
import Button from "../../components/ui/button/Button";
import { useWorkshopStore } from "../../stores/useWorkshopStore";

/* ---------- URL helper ---------- */
const ORIGIN = "https://www.programshouse.com";
const toAbsolute = (path) => {
  if (!path) return "";
  if (/^(https?:|data:|\/\/)/i.test(path)) return path;
  if (path.startsWith("/")) return `${ORIGIN}${path}`;
  return `${ORIGIN}/storage/${path}`;
};

// Cache-bust helper to avoid stale media after updates
const addCacheBust = (absoluteUrl) => {
  if (!absoluteUrl) return "";
  try {
    const u = new URL(absoluteUrl);
    u.searchParams.set("v", Date.now().toString());
    return u.toString();
  } catch {
    // Fallback for non-standard URLs
    const sep = absoluteUrl.includes("?") ? "&" : "?";
    return `${absoluteUrl}${sep}v=${Date.now()}`;
  }
};

/* ---------- Image validation ---------- */
const ALLOWED_IMAGE_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);
const ALLOWED_IMAGE_EXT = new Set(["png", "jpg", "jpeg", "webp", "svg", "gif"]);
const getExt = (name = "") => name.split(".").pop()?.toLowerCase() || "";

/* ---------- Limits ---------- */
const MAX_TITLE = 100;

/* ---------- Initial state ---------- */
const INITIAL = {
  id: null,
  title: "",
  description: "",
  link: "",
  video_link: "",
  alt: "",
  is_active: 1,
  features: [],          // Array of feature strings

  // local picked files
  imageFile: null,
  videoFile: null,

  // existing URLs from API
  imgExistingUrl: "",
  vidExistingUrl: "",

  // removal flags (sent to backend)
  remove_image: false,
  remove_video: false,
};

const getId = (x) => x?.id ?? x?._id ?? x?.uuid ?? null;

export default function WorkshopForm({ onSuccess, workshopId }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const resolvedId = workshopId ?? searchParams.get("id");
  const isReadOnly =
    searchParams.get("readonly") === "1" || searchParams.get("mode") === "view";

  const fetchworkshopById = useWorkshopStore((s) => s.fetchworkshopById);
  const createworkshop = useWorkshopStore((s) => s.createworkshop);
  const updateworkshop = useWorkshopStore((s) => s.updateworkshop);
  const deleteworkshop = useWorkshopStore((s) => s.deleteworkshop);

  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [imgErr, setImgErr] = useState("");
  const [videoErr, setVideoErr] = useState("");

  // keep & clean blob URLs
  const blobs = useRef({ img: null, vid: null });
  const revoke = (k) => {
    if (blobs.current[k]) {
      URL.revokeObjectURL(blobs.current[k]);
      blobs.current[k] = null;
    }
  };

  /* ---------- Load ---------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");

        if (resolvedId) {
          const w = await fetchworkshopById(resolvedId);
          setForm({
            ...INITIAL,
            id: getId(w),
            title: w?.title || "",
            description: w?.description || "",
            link: w?.link || "",
            video_link: w?.video_link || "",
            alt: w?.alt || "",
            is_active: Number(w?.is_active ?? 1),
            features: Array.isArray(w?.features) ? w.features : [],
            imgExistingUrl: w?.image || "",
            vidExistingUrl: w?.video || "",
          });
        } else {
          setForm(INITIAL);
        }
      } catch (e) {
        console.error(e);
        setErr("Couldn't load workshop. Try again.");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      revoke("img");
      revoke("vid");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedId]);

  /* ---------- Previews (CRITICAL FIX: honor remove flags) ---------- */
  const imgPreview = useMemo(() => {
    if (form.remove_image) return ""; // ✅ do NOT fallback to old image
    if (form.imageFile instanceof File) {
      revoke("img");
      const u = URL.createObjectURL(form.imageFile);
      blobs.current.img = u;
      return u;
    }
    return addCacheBust(toAbsolute(form.imgExistingUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.imageFile, form.imgExistingUrl, form.remove_image, saving]);

  const vidPreview = useMemo(() => {
    if (form.remove_video) return ""; // ✅ do NOT fallback to old video
    if (form.videoFile instanceof File) {
      revoke("vid");
      const u = URL.createObjectURL(form.videoFile);
      blobs.current.vid = u;
      return u;
    }
    return addCacheBust(toAbsolute(form.vidExistingUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.videoFile, form.vidExistingUrl, form.remove_video, saving]);

  /* ---------- Handlers ---------- */
  const onText = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onToggleActive = (e) =>
    setForm((p) => ({ ...p, is_active: e.target.checked ? 1 : 0 }));

  const onPickImage = (e) => {
    const f = e.target.files?.[0] || null;
    if (!f) {
      setImgErr("");
      setForm((p) => ({ ...p, imageFile: null }));
      return;
    }

    const ext = getExt(f.name);
    const okByType = ALLOWED_IMAGE_MIME.has(f.type);
    const okByExt = ALLOWED_IMAGE_EXT.has(ext);

    if (!okByType && !okByExt) {
      setImgErr("Image must be PNG, JPG/JPEG, WEBP, SVG, or GIF.");
      e.target.value = "";
      return;
    }

    setImgErr("");
    setForm((p) => ({
      ...p,
      imageFile: f,
      // mutually exclusive
      videoFile: null,

      // ✅ prevent fallback + cancel removal flags
      imgExistingUrl: "",
      remove_image: false,

      vidExistingUrl: "",
      remove_video: false,
    }));
  };

  const onPickVideo = (e) => {
    const f = e.target.files?.[0] || null;
    if (!f) {
      setVideoErr("");
      setForm((p) => ({ ...p, videoFile: null }));
      return;
    }

    const ext = getExt(f.name);
    const isVideo =
      f.type?.startsWith("video/") ||
      ["mp4", "mov", "m4v", "webm", "mkv", "avi", "wmv", "flv", "mpeg", "mpg", "3gp", "ogg", "ogv"].includes(ext);

    if (!isVideo) {
      setVideoErr("Please choose a valid video file.");
      e.target.value = "";
      return;
    }

    setVideoErr("");
    setForm((p) => ({
      ...p,
      videoFile: f,
      // mutually exclusive
      imageFile: null,

      // ✅ prevent fallback + cancel removal flags
      vidExistingUrl: "",
      remove_video: false,

      imgExistingUrl: "",
      remove_image: false,
    }));
  };

  const requestRemoveImage = () => {
    revoke("img");
    setForm((p) => ({
      ...p,
      imageFile: null,
      imgExistingUrl: "",
      remove_image: true, // ✅ IMPORTANT: will be sent
    }));
  };

  const requestRemoveVideo = () => {
    revoke("vid");
    setForm((p) => ({
      ...p,
      videoFile: null,
      vidExistingUrl: "",
      remove_video: true, // ✅ IMPORTANT: will be sent
    }));
  };

  // Features handlers
  const addFeature = () => {
    setForm((p) => ({ ...p, features: [...p.features, ""] }));
  };

  const updateFeature = (index, value) => {
    setForm((p) => ({
      ...p,
      features: p.features.map((f, i) => (i === index ? value : f)),
    }));
  };

  const removeFeature = (index) => {
    setForm((p) => ({
      ...p,
      features: p.features.filter((_, i) => i !== index),
    }));
  };

  /* ---------- Validation ---------- */
  const vErrs = useMemo(() => {
    const m = {};
    if (!form.title.trim()) m.title = "Required";
    if (form.title.length > MAX_TITLE) m.title = `Max ${MAX_TITLE} chars`;

    if (!form.description.trim()) m.description = "Required";

    if (form.link?.trim() && !/^https?:\/\//i.test(form.link.trim())) {
      m.link = "Link must start with http:// or https://";
    }
    return m;
  }, [form]);

  const disabledSubmit = useMemo(() => {
    const hasErrs = Object.keys(vErrs).length > 0 || !!imgErr || !!videoErr;
    if (isReadOnly) return false;
    return saving || hasErrs;
  }, [isReadOnly, saving, vErrs, imgErr, videoErr]);

  /* ---------- Submit ---------- */
  const submit = async (e) => {
    e.preventDefault();

    if (isReadOnly) {
      onSuccess ? onSuccess() : navigate("/workshops");
      return;
    }
    if (disabledSubmit) return;

    try {
      setSaving(true);
      setErr("");

      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("link", (form.link || "").trim());
      fd.append("video_link", (form.video_link || "").trim());
      fd.append("alt", (form.alt || "").trim());
      fd.append("is_active", String(Number(form.is_active ?? 1)));
      
      // Add features array properly
      const filteredFeatures = form.features.filter(f => f.trim() !== "");
      filteredFeatures.forEach((feature, index) => {
        fd.append(`features[${index}]`, feature);
      });

      // ✅ send remove flags
      if (form.remove_image === true) fd.append("remove_image", "1");
      if (form.remove_video === true) fd.append("remove_video", "1");

      // ✅ send new files (only if chosen)
      if (form.imageFile instanceof File) fd.append("image", form.imageFile);
      if (form.videoFile instanceof File) fd.append("video", form.videoFile);

      // OPTIONAL DEBUG (turn on when needed)
      // for (const pair of fd.entries()) console.log("[FD]", pair[0], pair[1]);

      let updated;
      if (form.id) {
        updated = await updateworkshop(form.id, fd);
      } else {
        updated = await createworkshop(fd);
      }

      // ✅ keep UI consistent after save
      setForm((p) => ({
        ...p,
        id: getId(updated) ?? p.id,
        imageFile: null,
        videoFile: null,
        imgExistingUrl: updated?.image || "",
        vidExistingUrl: updated?.video || "",
        remove_image: false,
        remove_video: false,
      }));

      onSuccess ? onSuccess() : navigate("/workshops");
    } catch (e2) {
      console.error(e2);
      setErr(e2?.response?.data?.message || "Error saving workshop.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Workshop Management | ProfMSE">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader title="Workshop Management" description="Manage workshops" />
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
    <div title={`${isReadOnly ? "View" : form.id ? "Edit" : "Add"} Workshop | ProfMSE`}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          title={`${isReadOnly ? "View" : form.id ? "Edit" : "Add"} Workshop`}
          description="Keep workshops up to date."
        >
          {!!form?.id && !isReadOnly && (
            <Button
              variant="danger"
              onClick={async () => {
                if (!deleteworkshop) return alert("Delete is not wired in the store.");
                if (!window.confirm("Delete this workshop?")) return;
                try {
                  setSaving(true);
                  await deleteworkshop(form.id);
                  onSuccess ? onSuccess() : navigate("/workshops");
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className="mr-3"
            >
              {saving ? "Deleting…" : "Delete"}
            </Button>
          )}

          <Button variant="secondary" onClick={() => navigate("/workshops")} className="mr-3">
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
            title="Workshop Information"
            onSubmit={submit}
            onCancel={() => (onSuccess ? onSuccess() : navigate("/workshops"))}
            submitText={isReadOnly ? "Close" : saving ? "Saving…" : form.id ? "Update Workshop" : "Create Workshop"}
            submitDisabled={disabledSubmit}
          >
            {/* Title row */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={onText}
                  maxLength={MAX_TITLE}
                  className={`${inputCls} ${disabledCls}`}
                  required
                  disabled={isReadOnly}
                />
                <p className="text-xs text-gray-500 mt-1">{form.title.length}/{MAX_TITLE}</p>
                {vErrs.title && <p className="text-xs text-red-600 mt-1">{vErrs.title}</p>}
              </div>

              {/* Description row */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onText}
                  rows={5}
                  className={`${inputCls} ${disabledCls}`}
                  required
                  disabled={isReadOnly}
                />
                {vErrs.description && <p className="text-xs text-red-600 mt-1">{vErrs.description}</p>}
              </div>

              {/* Features row */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Features
                </label>
                <div className="space-y-2">
                  {form.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                        className={`${inputCls} ${disabledCls}`}
                        disabled={isReadOnly}
                      />
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                    >
                      Add Feature
                    </button>
                  )}
                </div>
              </div>

              {/* Link row */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link
                </label>
                <input
                  name="link"
                  value={form.link}
                  onChange={onText}
                  className={`${inputCls} ${disabledCls}`}
                  disabled={isReadOnly}
                />
                {vErrs.link && <p className="text-xs text-red-600 mt-1">{vErrs.link}</p>}
              </div>

              {/* Video Link row */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Video Link
                </label>
                <input
                  name="video_link"
                  value={form.video_link}
                  onChange={onText}
                  className={`${inputCls} ${disabledCls}`}
                  disabled={isReadOnly}
                  placeholder="https://example.com/video"
                />
              </div>

              {/* Alt Text row */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Alt Text (for image accessibility)
                </label>
                <input
                  name="alt"
                  value={form.alt}
                  onChange={onText}
                  className={`${inputCls} ${disabledCls}`}
                  disabled={isReadOnly}
                  placeholder="Describe the image for screen readers"
                  maxLength={255}
                />
                <p className="text-xs text-gray-500 mt-1">{form.alt.length}/255</p>
              </div>

              {/* Active row */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={Number(form.is_active) === 1}
                  onChange={onToggleActive}
                  disabled={isReadOnly}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Active on website</span>
              </div>
            </div>

            {/* Media rows */}
            <div className="grid grid-cols-1 gap-6 mt-6">
              {/* Image row */}
              <div className={isReadOnly ? "  pointer-events-none" : ""}>
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

                {imgPreview ? (
                  <div className="mt-2">
                    <img
                      src={imgPreview}
                      alt="Workshop"
                      className="h-32 w-32 rounded object-cover border border-gray-200 dark:border-gray-700"
                    />
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={requestRemoveImage}
                        className="mt-2 block text-xs text-red-600 hover:underline"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                ) : (
                  (!isReadOnly && (form.imgExistingUrl || form.imageFile || form.remove_image)) ? (
                    <div className="mt-2 text-xs text-gray-500">
                      {form.remove_image ? "Image will be removed on save." : "No image selected."}
                    </div>
                  ) : null
                )}

                {!isReadOnly && form.remove_image && (
                  <p className="mt-1 text-xs text-amber-600">Image will be removed on save.</p>
                )}
              </div>

              {/* Video row */}
              <div className={isReadOnly ? "  pointer-events-none" : ""}>
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

                {vidPreview ? (
                  <div className="mt-2">
                    <video
                      src={vidPreview}
                      controls
                      className="w-full max-h-48 rounded border border-gray-200 dark:border-gray-700"
                    />
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={requestRemoveVideo}
                        className="mt-2 block text-xs text-red-600 hover:underline"
                      >
                        Remove video
                      </button>
                    )}
                  </div>
                ) : (
                  (!isReadOnly && (form.vidExistingUrl || form.videoFile || form.remove_video)) ? (
                    <div className="mt-2 text-xs text-gray-500">
                      {form.remove_video ? "Video will be removed on save." : "No video selected."}
                    </div>
                  ) : null
                )}

                {!isReadOnly && form.remove_video && (
                  <p className="mt-1 text-xs text-amber-600">Video will be removed on save.</p>
                )}
              </div>
            </div>
          </AdminForm>
        </div>
      </div>
    </div>
  );
}
