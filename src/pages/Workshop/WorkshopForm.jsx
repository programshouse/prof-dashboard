import React, { useState, useEffect, useMemo } from "react";
import AdminForm from "../../components/ui/AdminForm";
import FileUpload from "../../components/ui/FileUpload";
import { useWorkshopStore } from "../../stores/useWorkshopStore";

// Build absolute URL if API returns relative paths
const makeAbsolute = (path) => {
  if (!path) return null;
  if (/^(https?:|data:|\/\/)/i.test(path)) return path;
  return `https://www.programshouse.com${path.startsWith("/") ? path : `/${path}`}`;
};

const INITIAL = {
  title: "",
  description: "",
  link: "",
  video: null, // File or URL string (XOR with image)
  image: null, // File or URL string (XOR with video)
};

export default function WorkshopForm({ workshopId, onSuccess }) {
  const [formData, setFormData] = useState(INITIAL);
  const [loading, setLoading] = useState(!!workshopId);
  const [saving, setSaving] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [mediaError, setMediaError] = useState("");

  // store methods (exact names from your store)
  const fetchworkshopById = useWorkshopStore((s) => s.fetchworkshopById);
  const createworkshop    = useWorkshopStore((s) => s.createworkshop);
  const updateworkshop    = useWorkshopStore((s) => s.updateworkshop);

  useEffect(() => {
    if (!workshopId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchworkshopById(workshopId);
        setFormData({
          title: data?.title ?? "",
          description: data?.description ?? "",
          link: data?.link ?? "",
          video: typeof data?.video === "string" ? data.video : null,
          image: typeof data?.image === "string" ? data.image : null,
        });
      } catch (e) {
        console.error("Error loading workshop:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [workshopId, fetchworkshopById]);

  const videoPreview = useMemo(() => {
    if (formData.video instanceof File) return URL.createObjectURL(formData.video);
    return makeAbsolute(formData.video);
  }, [formData.video]);

  const imagePreview = useMemo(() => {
    if (formData.image instanceof File) return URL.createObjectURL(formData.image);
    return makeAbsolute(formData.image);
  }, [formData.image]);

  const validateLink = (val) => {
    if (!val) { setLinkError(""); return true; }
    try {
      const u = new URL(val);
      if (!/^https?:$/i.test(u.protocol)) throw new Error("invalid");
      setLinkError("");
      return true;
    } catch {
      setLinkError("Please enter a valid URL starting with http:// or https://");
      return false;
    }
  };

  const validateMedia = (videoVal, imageVal) => {
    const hasVideo = !!videoVal;
    const hasImage = !!imageVal;
    if (!hasVideo && !hasImage) { setMediaError("Please provide either a video or an image."); return false; }
    if (hasVideo && hasImage)   { setMediaError("Choose only one: either video or image, not both."); return false; }
    setMediaError(""); return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "link") validateLink(value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;
    setFormData((prev) => {
      if (name === "video") return { ...prev, video: file, image: null };
      if (name === "image") return { ...prev, image: file, video: null };
      return prev;
    });
  };

  const clearMedia = (type) => setFormData((prev) => ({ ...prev, [type]: null }));

  // JSON payload (your store sends JSON only)
  const buildJsonPayload = () => ({
    title: formData.title?.trim(),
    description: formData.description?.trim(),
    link: formData.link?.trim() || "",
    video: typeof formData.video === "string" ? formData.video : null,
    image: typeof formData.image === "string" ? formData.image : null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const okMedia = validateMedia(formData.video, formData.image);
    const okLink  = validateLink(formData.link);
    if (!okMedia || !okLink) return;

    try {
      setSaving(true);
      const body = buildJsonPayload();
      if (workshopId) {
        await updateworkshop(workshopId, body);
      } else {
        await createworkshop(body);
      }
      onSuccess && onSuccess();
    } catch (error) {
      console.error("Error saving workshop:", error);
      alert(error?.response?.data?.message || "Error saving workshop. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => onSuccess && onSuccess();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto" />
        <p className="mt-2 text-gray-600 dark:text-gray-300">Loading workshop...</p>
      </div>
    );
  }

  return (
    <AdminForm
      title={workshopId ? "Edit Workshop" : "Add New Workshop"}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitText={saving ? "Saving..." : (workshopId ? "Update Workshop" : "Create Workshop")}
      submitDisabled={saving}
    >
      {/* Title + Link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Workshop Title *</label>
          <input
            type="text" name="title" value={formData.title} onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Link (optional)</label>
          <input
            type="url" name="link" value={formData.link} onChange={handleInputChange}
            placeholder="https://example.com/workshop"
            className={`${linkError ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-brand-500"} w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
            inputMode="url" pattern="https?://.*"
          />
          {linkError && <p className="mt-1 text-xs text-red-600">{linkError}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
        <textarea
          name="description" value={formData.description} onChange={handleInputChange} rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
      </div>

      {/* Media (video OR image) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FileUpload label="Workshop Video (choose this OR an image)" name="video" value={formData.video} onChange={handleFileChange} accept="video/*" />
          {videoPreview && (
            <div className="mt-2">
              <video src={videoPreview} controls className="w-full max-h-48 rounded border border-gray-200 dark:border-gray-700" />
              <button type="button" onClick={() => clearMedia("video")} className="mt-2 text-xs text-red-600 hover:underline">Remove video</button>
            </div>
          )}
          {formData.video instanceof File && (
            <p className="mt-1 text-xs text-amber-600">Note: API accepts media URLs via JSON; selected files are ignored unless backend supports uploads.</p>
          )}
        </div>

        <div>
          <FileUpload label="Workshop Image (choose this OR a video)" name="image" value={formData.image} onChange={handleFileChange} accept="image/*" />
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Workshop" className="h-32 w-32 rounded object-cover border border-gray-200 dark:border-gray-700" />
              <button type="button" onClick={() => clearMedia("image")} className="mt-2 block text-xs text-red-600 hover:underline">Remove image</button>
            </div>
          )}
          {formData.image instanceof File && (
            <p className="mt-1 text-xs text-amber-600">Note: API accepts media URLs via JSON; selected files are ignored unless backend supports uploads.</p>
          )}
        </div>
      </div>

      {!!mediaError && (
        <div className="mt-2 rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-300">
          {mediaError}
        </div>
      )}
    </AdminForm>
  );
}
