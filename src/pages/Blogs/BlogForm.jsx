// /src/pages/Blogs/BlogFormTiny.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminForm from "../../components/ui/AdminForm";
import FileUpload from "../../components/ui/FileUpload";
import { useBlogsStore } from "../../stores/useBlogStore.js";
import { Editor } from "@tinymce/tinymce-react";

export default function BlogFormTiny({
  blogId,
  onSuccess,
  apiKey = import.meta.env.VITE_TINYMCE_API_KEY || "your-api-key-here",
  readOnly: readOnlyProp,
}) {
  const [searchParams] = useSearchParams();
  const resolvedId = blogId ?? searchParams.get("id");
  const isReadOnly =
    readOnlyProp === true ||
    searchParams.get("readonly") === "1" ||
    searchParams.get("mode") === "view";

  const [loading, setLoading] = useState(!!resolvedId);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDesc] = useState("");
  const [image, setImage] = useState(null); // File | string(url) | null
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");

  const fetchBlogById = useBlogsStore((s) => s.fetchBlogById);
  const createBlog = useBlogsStore((s) => s.createBlog);
  const updateBlog = useBlogsStore((s) => s.updateBlog);

  const validateLink = (val) => {
    if (!val) {
      setLinkError("");
      return true;
    }
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

  // FileUpload can send event OR direct value (File/string/null)
  const onFile = (evtOrValue) => {
    if (isReadOnly) return;

    let next = null;

    // native event
    if (evtOrValue?.target?.files) {
      next = evtOrValue.target.files?.[0] || null;
    } else if (evtOrValue instanceof File || evtOrValue === null) {
      next = evtOrValue;
    } else if (typeof evtOrValue === "string") {
      next = evtOrValue;
    }

    setImage(next);
  };

  // safe preview + cleanup
  const imagePreview = useMemo(() => {
    if (image instanceof File) return URL.createObjectURL(image);
    return typeof image === "string" ? image : null;
  }, [image]);

  useEffect(() => {
    if (!(image instanceof File)) return;
    const url = URL.createObjectURL(image);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  // LOAD for show/edit
  useEffect(() => {
    if (!resolvedId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchBlogById(resolvedId);

        setTitle(data?.title || "");
        setDesc(data?.content ?? data?.description ?? "");
        // ✅ use "image" from API (not icon)
        setImage(data?.image ?? data?.icon ?? null);
        setLink(data?.link || "");
      } finally {
        setLoading(false);
      }
    })();
  }, [resolvedId, fetchBlogById]);

  const submit = async (e) => {
    e.preventDefault();

    if (isReadOnly) {
      onSuccess?.();
      return;
    }

    if (!title.trim() || !description.trim()) return;
    if (!validateLink(link)) return;

    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("content", description);

      if (link?.trim()) fd.append("link", link.trim());

      // ✅ only send file if it is File (real upload)
      if (image instanceof File) {
        fd.append("image", image);
      }

      // Create vs Update
      if (resolvedId) {
        // ✅ Laravel-friendly multipart update
        fd.append("_method", "PATCH");
        await updateBlog(resolvedId, fd, { forcePost: true });
      } else {
        await createBlog(fd);
      }

      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Error saving blog. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => onSuccess?.();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading blog…</p>
      </div>
    );
  }

  return (
    <AdminForm
      title={
        resolvedId
          ? isReadOnly
            ? "View Blog Post"
            : "Edit Blog Post"
          : "Add New Blog Post"
      }
      onSubmit={submit}
      onCancel={cancel}
      submitText={isReadOnly ? "Close" : saving ? "Saving..." : resolvedId ? "Update Blog" : "Create Blog"}
      submitDisabled={isReadOnly ? false : saving || !title.trim() || !description.trim() || !!linkError}
    >
      {/* Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Blog Title *
        </label>
        <input
          name="title"
          value={title}
          onChange={(e) => !isReadOnly && setTitle(e.target.value)}
          required
          maxLength={140}
          disabled={isReadOnly}
          placeholder="Write a clear, searchable title…"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            isReadOnly ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "border-gray-300 focus:ring-brand-500"
          }`}
        />
        <p className="text-xs text-gray-500 mt-1">{title.length}/140</p>
      </div>

      {/* Link (optional) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Link (optional)
        </label>
        <input
          type="url"
          name="link"
          value={link}
          disabled={isReadOnly}
          onChange={(e) => {
            if (isReadOnly) return;
            setLink(e.target.value);
            validateLink(e.target.value);
          }}
          placeholder="https://example.com/blog"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            linkError && !isReadOnly
              ? "border-red-500 focus:ring-red-400"
              : isReadOnly
              ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              : "border-gray-300 focus:ring-brand-500"
          }`}
          inputMode="url"
          pattern="https?://.*"
        />
        {linkError && !isReadOnly && <p className="mt-1 text-xs text-red-600">{linkError}</p>}
      </div>

      {/* Image */}
      <div className="mb-6">
        {/* ✅ IMPORTANT: name="image" */}
        <FileUpload
          label="Image / Cover (optional)"
          name="image"
          value={image}
          onChange={onFile}
          accept="image/*"
          disabled={isReadOnly}
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mt-2 h-20 w-20 rounded object-cover border border-gray-200"
          />
        )}

        {/* Helpful notice */}
        {!isReadOnly && typeof image === "string" && (
          <p className="mt-1 text-xs text-gray-500">
            Current image is already stored as URL in the API.
          </p>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Content *
        </label>
        <Editor
          apiKey={apiKey}
          value={description}
          onEditorChange={(html) => !isReadOnly && setDesc(html)}
          init={{
            height: 520,
            menubar: false,
            readonly: isReadOnly ? 1 : 0,
            plugins:
              "anchor autolink charmap code codesample directionality emoticons image link lists media preview searchreplace table visualblocks wordcount",
            toolbar: isReadOnly
              ? "preview | code"
              : "undo redo | blocks | bold italic underline strikethrough | align bullist numlist outdent indent | link image media table | removeformat | ltr rtl | code preview",
            convert_urls: false,
            content_style:
              "body{font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif; font-size:15px; line-height:1.7;}",
          }}
        />
      </div>
    </AdminForm>
  );
}
