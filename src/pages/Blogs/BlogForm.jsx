// /src/pages/Blogs/BlogFormTiny.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";            // 👈 add this
import AdminForm from "../../components/ui/AdminForm";
import FileUpload from "../../components/ui/FileUpload";
import { useBlogsStore } from "../../stores/useBlogStore.js";
import { Editor } from "@tinymce/tinymce-react";

export default function BlogFormTiny({
  blogId,
  onSuccess,
  apiKey = "lmml35k9i4dyhe5swfgxoufuqhwpbcqgz25m38779fehig9r",
  readOnly: readOnlyProp,
}) {
  const [searchParams] = useSearchParams();                    // 👈
  const resolvedId = blogId ?? searchParams.get("id");         // 👈 use URL id if prop missing
  const isReadOnly =
    readOnlyProp === true ||
    searchParams.get("readonly") === "1" ||
    searchParams.get("mode") === "view";

  const [loading, setLoading] = useState(!!resolvedId);        // 👈
  const [saving, setSaving]   = useState(false);

  // form state...
  const [title, setTitle] = useState("");
  const [description, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");

  const fetchBlogById = useBlogsStore((s) => s.fetchBlogById);
  const createBlog    = useBlogsStore((s) => s.createBlog);
  const updateBlog    = useBlogsStore((s) => s.updateBlog);

  const validateLink = (val) => {
    if (!val) { setLinkError(""); return true; }
    try {
      const u = new URL(val);
      if (!/^https?:$/i.test(u.protocol)) throw new Error("bad protocol");
      setLinkError(""); return true;
    } catch { setLinkError("Please enter a valid URL starting with http:// or https://"); return false; }
  };

  const onFile = (evtOrValue) => {
    if (isReadOnly) return;
    if (evtOrValue?.target?.files) {
      setImage(evtOrValue.target.files?.[0] || null);
      return;
    }
    if (typeof evtOrValue === "string" || evtOrValue instanceof File || evtOrValue === null) {
      setImage(evtOrValue);
    }
  };

  const imagePreview = useMemo(() => (image instanceof File ? URL.createObjectURL(image) : (typeof image === "string" ? image : null)), [image]);

  // ===== LOAD (uses resolvedId now) =====
  useEffect(() => {
    if (!resolvedId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchBlogById(resolvedId);          // 👈
        setTitle(data?.title || "");
        setDesc(data?.content ?? data?.description ?? "");
        setImage(data?.icon ?? data?.image ?? null);
        setLink(data?.link || "");
      } finally {
        setLoading(false);
      }
    })();
  }, [resolvedId, fetchBlogById]);                              // 👈

  const buildBody = () => ({
    title: title.trim(),
    content: description,
    link: link.trim(),
    icon: typeof image === "string" ? image : null,
  });

  const submit = async (e) => {
    e.preventDefault();
    if (isReadOnly) { onSuccess && onSuccess(); return; }
    if (!title.trim() || !description.trim()) return;
    if (!validateLink(link)) return;
    try {
      setSaving(true);
      const body = buildBody();
      if (resolvedId) await updateBlog(resolvedId, body);      // 👈
      else await createBlog(body);
      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Error saving blog. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => onSuccess && onSuccess();

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
      title={resolvedId ? (isReadOnly ? "View Blog Post" : "Edit Blog Post") : "Add New Blog Post"}  // 👈
      onSubmit={submit}
      onCancel={cancel}
      submitText={isReadOnly ? "Close" : saving ? "Saving..." : resolvedId ? "Update Blog" : "Create Blog"} // 👈
      submitDisabled={isReadOnly ? false : saving || !title.trim() || !description.trim() || !!linkError}
    >
      {/* Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blog Title *</label>
        <input
          name="title"
          value={title}
          onChange={(e) => !isReadOnly && setTitle(e.target.value)}
          required
          maxLength={140}
          placeholder="Write a clear, searchable title…"
          disabled={isReadOnly}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            isReadOnly ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "border-gray-300 focus:ring-brand-500"
          }`}
        />
        <p className="text-xs text-gray-500 mt-1">{title.length}/140</p>
      </div>

      {/* Link */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Link (optional)</label>
        <input
          type="url"
          name="link"
          value={link}
          onChange={(e) => { if (isReadOnly) return; setLink(e.target.value); validateLink(e.target.value); }}
          placeholder="https://example.com/blog"
          disabled={isReadOnly}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            linkError && !isReadOnly ? "border-red-500 focus:ring-red-400"
            : isReadOnly ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            : "border-gray-300 focus:ring-brand-500"
          }`}
          inputMode="url"
          pattern="https?://.*"
        />
        {linkError && !isReadOnly && <p className="mt-1 text-xs text-red-600">{linkError}</p>}
      </div>

      {/* Icon */}
      <div className="mb-6">
        <FileUpload
          label="Icon / Cover (optional)"
          name="icon"
          value={image}
          onChange={onFile}
          accept="image/*"
          disabled={isReadOnly}
        />
        {imagePreview && (
          <img src={imagePreview} alt="Icon preview" className="mt-2 h-20 w-20 rounded object-cover border border-gray-200" />
        )}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content *</label>
        <Editor
          apiKey={apiKey}
          value={description}
          onEditorChange={(html) => !isReadOnly && setDesc(html)}
          init={{
            height: 520,
            menubar: false,
            readonly: isReadOnly ? 1 : 0,
            plugins: "anchor autolink charmap code codesample directionality emoticons image link lists media preview searchreplace table visualblocks wordcount",
            toolbar: isReadOnly
              ? "preview | code"
              : "undo redo | blocks | bold italic underline strikethrough | align bullist numlist outdent indent | link image media table | removeformat | ltr rtl | code preview",
            convert_urls: false,
            content_style: "body{font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif; font-size:15px; line-height:1.7;}",
          }}
        />
      </div>
    </AdminForm>
  );
}
