// src/pages/blog/BlogFormTiny.jsx
import React, { useEffect, useState } from "react";
import AdminForm from "../../components/ui/AdminForm";
import FileUpload from "../../components/ui/FileUpload";
import { blogsAPI } from "../../services/api";
import { Editor } from "@tinymce/tinymce-react";

export default function BlogFormTiny({ blogId, onSuccess, apiKey = "lmml35k9i4dyhe5swfgxoufuqhwpbcqgz25m38779fehig9r" }) {
  const [loading, setLoading] = useState(!!blogId);
  const [saving, setSaving]   = useState(false);

  const [title, setTitle]           = useState("");
  const [description, setDesc]      = useState(""); // HTML
  const [image, setImage]           = useState(null); // File or URL string

  // load for edit
  useEffect(() => {
    if (!blogId) return;
    (async () => {
      try {
        setLoading(true);
        const { data } = await blogsAPI.getById(blogId);
        setTitle(data?.title || "");
        setDesc(data?.description || "");
        setImage(data?.image || null); // can be URL
      } finally {
        setLoading(false);
      }
    })();
  }, [blogId]);

  const onFile = (e) => {
    const f = e.target.files?.[0] || null;
    setImage(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("description", description);

      // only append if it's a new File; skip if unchanged string URL
      if (image instanceof File) fd.append("image", image);

      if (blogId) await blogsAPI.update(blogId, fd);
      else await blogsAPI.create(fd);

      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      alert("Error saving blog. Please try again.");
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
      submitDisabled={saving || !title.trim() || !description.trim()}
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

      {/* Image */}
      <div className="mb-6">
        <FileUpload
          label="Cover Image (optional)"
          name="image"
          value={image}
          onChange={onFile}
          accept="image/*"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Blog Content *
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
            // Quick inline (base64) embeds for pasted images; switch to server upload if needed
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
