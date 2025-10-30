import React, { useEffect, useMemo, useState } from "react";
import AdminForm from "../../components/ui/AdminForm";
import FileUpload from "../../components/ui/FileUpload";
import { useBlogsStore } from "../../stores/useBlogStore.js";
import { Editor } from "@tinymce/tinymce-react";

export default function BlogFormTiny({
  blogId,
  onSuccess,
  apiKey = "lmml35k9i4dyhe5swfgxoufuqhwpbcqgz25m38779fehig9r",
}) {
  const [loading, setLoading] = useState(!!blogId);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDesc] = useState(""); // HTML (Description)
  const [image, setImage] = useState(null);    // File or URL string
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");

  // store fns
  const fetchBlogById = useBlogsStore((s) => s.fetchBlogById);
  const createBlog    = useBlogsStore((s) => s.createBlog);
  const updateBlog    = useBlogsStore((s) => s.updateBlog);

  // --- helpers ---
  const validateLink = (val) => {
    if (!val) { setLinkError(""); return true; } // optional
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

  const onFile = (e) => {
    const f = e.target.files?.[0] || null;
    setImage(f);
  };

  const imagePreview = useMemo(() => {
    if (image instanceof File) return URL.createObjectURL(image);
    return typeof image === "string" ? image : null;
  }, [image]);

  // --- load for edit ---
  useEffect(() => {
    if (!blogId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchBlogById(blogId);
        setTitle(data?.title || "");
        setDesc(data?.description || "");
        setImage(data?.image || null); // can be URL
        setLink(data?.link || "");
      } finally {
        setLoading(false);
      }
    })();
  }, [blogId, fetchBlogById]);

  // Build JSON body (store is JSON-only)
  const buildBody = () => ({
    title: title.trim(),
   content ,                    // keep HTML (Description)
    link: link.trim(),              // empty string ok for optional
    image: typeof image === "string" ? image : null, // File ignored in JSON mode
  });

  // --- submit ---
  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    if (!validateLink(link)) return;

    try {
      setSaving(true);
      const body = buildBody();

      if (blogId) await updateBlog(blogId, body);
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
      title={blogId ? "Edit Blog Post" : "Add New Blog Post"}
      onSubmit={submit}
      onCancel={cancel}
      submitText={saving ? "Saving..." : blogId ? "Update Blog" : "Create Blog"}
      submitDisabled={saving || !title.trim() || !description.trim() || !!linkError}
    >
      {/* Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Blog Title *
        </label>
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={140}
          placeholder="Write a clear, searchable title…"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
          onChange={(e) => {
            setLink(e.target.value);
            validateLink(e.target.value);
          }}
          placeholder="https://example.com/blog"
          className={`${
            linkError ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-brand-500"
          } w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
          inputMode="url"
          pattern="https?://.*"
        />
        {linkError && <p className="mt-1 text-xs text-red-600">{linkError}</p>}
      </div>

      {/* Image (JSON-only: send URL string) */}
      <div className="mb-6">
        <FileUpload
          label="Cover Image (optional)"
          name="image"
          value={image}
          onChange={onFile}
          accept="image/*"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Cover preview"
            className="mt-2 h-20 w-20 rounded object-cover border border-gray-200"
          />
        )}
        {image instanceof File && (
          <p className="mt-1 text-xs text-amber-600">
            Note: current API/store sends JSON only. File will be ignored unless you provide a URL or enable multipart on the backend.
          </p>
        )}
      </div>

      {/*content  */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
         content  *
        </label>
        <Editor
          apiKey={apiKey}
          value={description}
          onEditorChange={(html) => setDesc(html)}
          init={{
            height: 520,
            menubar: false,
            plugins:
              "anchor autolink charmap code codesample directionality emoticons image link lists media preview searchreplace table visualblocks wordcount",
            toolbar:
              "undo redo | blocks | bold italic underline strikethrough | " +
              "align bullist numlist outdent indent | link image media table | " +
              "removeformat | ltr rtl | code preview",
            convert_urls: false,
            content_style:
              "body{font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif; font-size:15px; line-height:1.7;}",
            images_upload_handler: (blobInfo) =>
              new Promise((resolve) => {
                resolve("data:" + blobInfo.blob().type + ";base64," + blobInfo.base64());
              }),
          }}
        />
      </div>
    </AdminForm>
  );
}
