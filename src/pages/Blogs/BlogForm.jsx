// /src/pages/Blogs/BlogFormTiny.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const [category, setCategory] = useState("");
  const [alt, setAlt] = useState("");
  const [image, setImage] = useState(null); // File | string(url) | null
  const [contentImages, setContentImages] = useState([]); // File[]
  const [existingContentImages, setExistingContentImages] = useState([]); // string[] from API
  const editorRef = useRef(null);
  const contentImagesRef = useRef([]);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");

  const fetchBlogById = useBlogsStore((s) => s.fetchBlogById);
  const createBlog = useBlogsStore((s) => s.createBlog);
  const updateBlog = useBlogsStore((s) => s.updateBlog);


  const escapeHtmlAttribute = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  // Convert the API's ordered content blocks back into one editor document.
  // Existing images are inserted exactly where they were saved.
  const parseContent = (rawContent) => {
    if (!rawContent) return { html: "", images: [] };

    let parsed = rawContent;

    // Some older responses may be JSON encoded more than once.
    for (let i = 0; i < 2 && typeof parsed === "string"; i += 1) {
      const trimmed = parsed.trim();
      if (!trimmed) return { html: "", images: [] };

      try {
        const decoded = JSON.parse(trimmed);
        parsed = decoded;
      } catch {
        return { html: rawContent, images: [] };
      }
    }

    if (!Array.isArray(parsed)) {
      return { html: typeof rawContent === "string" ? rawContent : "", images: [] };
    }

    const images = [];
    const html = parsed
      .map((item) => {
        if (item?.type === "text") {
          return typeof item?.value === "string" ? item.value : "";
        }

        if (item?.type === "image" && typeof item?.value === "string" && item.value) {
          images.push(item.value);
          const src = escapeHtmlAttribute(item.value);
          const alt = escapeHtmlAttribute(item?.alt || "");
          return `<div class="blog-content-image" data-blog-image-block="existing" data-blog-existing-src="${src}"><img src="${src}" alt="${alt}" data-blog-existing-image="1" /></div>`;
        }

        return "";
      })
      .join("");

    return { html, images };
  };

  const hasMeaningfulContent = (html) => {
    if (!html) return false;
    const doc = new DOMParser().parseFromString(html, "text/html");
    return !!doc.body.textContent?.trim() || !!doc.body.querySelector("img[data-blog-content-image], img[data-blog-existing-image], img[src]");
  };

  // Build the exact ordered JSON expected by Laravel:
  // text -> image -> text -> image -> text ...
  // IMPORTANT: replace the WHOLE image block, not only <img>.
  // Replacing only <img> leaves the marker inside <p>/<div>, which can make
  // Create serialize the text first and the images later.
  const buildOrderedContent = (html) => {
    const doc = new DOMParser().parseFromString(html || "", "text/html");
    const body = doc.body;
    const markers = [];

    body.querySelectorAll("[data-blog-image-block]").forEach((block) => {
      const img = block.querySelector("img");
      if (!img) return;

      const newIndex = block.getAttribute("data-blog-content-image-index");
      const existingSrc =
        block.getAttribute("data-blog-existing-src") ||
        img.getAttribute("src") ||
        "";
      const altText = img.getAttribute("alt") || null;

      const markerIndex = markers.length;

      if (newIndex !== null && newIndex !== "") {
        markers.push({
          type: "image",
          image_index: Number(newIndex),
          alt: altText,
        });
      } else if (existingSrc) {
        markers.push({
          type: "image",
          value: existingSrc,
          alt: altText,
        });
      } else {
        return;
      }

      block.replaceWith(doc.createTextNode(`__BLOG_IMAGE_${markerIndex}__`));
    });

    const serialized = body.innerHTML;
    const parts = serialized.split(/(__BLOG_IMAGE_\d+__)/g);
    const ordered = [];

    parts.forEach((part) => {
      const markerMatch = part.match(/^__BLOG_IMAGE_(\d+)__$/);

      if (markerMatch) {
        const imageBlock = markers[Number(markerMatch[1])];
        if (imageBlock) ordered.push(imageBlock);
        return;
      }

      if (!part) return;

      const testDoc = new DOMParser().parseFromString(part, "text/html");
      const hasText = !!testDoc.body.textContent?.trim();
      const hasMedia = !!testDoc.body.querySelector(
        "video,audio,iframe,table,ul,ol,blockquote,pre"
      );

      // Ignore empty paragraphs that TinyMCE adds around image blocks.
      if (!hasText && !hasMedia) return;

      ordered.push({
        type: "text",
        value: part,
      });
    });

    return ordered;
  };

  const addImagesAtEditorCursor = (files) => {
    if (!files?.length || !editorRef.current) return;

    const editor = editorRef.current;

    // Restore the last cursor position inside the editor (important when the
    // files were picked from the outside "Content Images" box, where the
    // editor has lost focus). Without this the image can land at the wrong place.
    editor.focus();

    const startIndex = contentImagesRef.current.length;
    const nextFiles = [...contentImagesRef.current, ...files];

    contentImagesRef.current = nextFiles;
    setContentImages(nextFiles);

    files.forEach((file, offset) => {
      const imageIndex = startIndex + offset;
      const previewUrl = URL.createObjectURL(file);
      const altText = escapeHtmlAttribute(file.name || "Content image");

      editor.insertContent(
        `<div class="blog-content-image" data-blog-image-block="new" data-blog-content-image-index="${imageIndex}"><img src="${previewUrl}" alt="${altText}" data-blog-content-image="1" /></div><p><br></p>`
      );
    });
  };

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

        const parsedContent = parseContent(data?.content ?? data?.description ?? "");
        setDesc(parsedContent.html);
        setExistingContentImages(parsedContent.images);
        contentImagesRef.current = [];
        setContentImages([]);

        setCategory(data?.category || "");
        setAlt(data?.alt || "");
        // ✅ use "image" from API (not icon)
        setImage(data?.image ?? data?.icon ?? null);
        setLink(data?.link || "");
      } finally {
        setLoading(false);
      }
    })();
  }, [resolvedId, fetchBlogById]);

  // Build the same multipart body for create and update.
  const buildFormData = (orderedContent) => {
    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("content", JSON.stringify(orderedContent));
    fd.append("category", category.trim());
    fd.append("alt", alt.trim());
    if (link?.trim()) fd.append("link", link.trim());
    return fd;
  };

  // CREATE -> make it behave exactly like UPDATE.
  //
  // Update keeps the order correctly because every image block already carries
  // its final URL (`value`). On create the images are brand new, so the server
  // only knows `image_index`, and it can place them after the text.
  // Fix: after the create call, read the URLs the server just stored for the
  // uploaded images (in upload order), swap every `image_index` for its real URL
  // and save once through the normal UPDATE request. The final saved content is
  // then identical to what Update produces.
  const finalizeCreatedOrder = async (created, orderedContent) => {
    const uploadedCount = contentImagesRef.current.length;
    if (!uploadedCount || !created?.id) return;

    let urls = parseContent(created?.content).images;

    if (urls.length !== uploadedCount) {
      const fresh = await fetchBlogById(created.id);
      urls = parseContent(fresh?.content).images;
    }

    if (urls.length !== uploadedCount) {
      throw new Error(
        `Expected ${uploadedCount} stored content images but the server returned ${urls.length}`
      );
    }

    const finalContent = orderedContent.map((block) => {
      if (block.type === "image" && block.image_index !== undefined) {
        return { type: "image", value: urls[block.image_index], alt: block.alt };
      }
      return block;
    });

    const fd = buildFormData(finalContent);
    fd.append("_method", "PATCH");
    await updateBlog(created.id, fd, { forcePost: true });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (isReadOnly) {
      onSuccess?.();
      return;
    }

    if (!title.trim() || !hasMeaningfulContent(description)) return;
    if (!validateLink(link)) return;

    try {
      setSaving(true);

      // Read directly from TinyMCE at submit time. This avoids React state
      // being one editor change behind on CREATE (especially immediately
      // after inserting an image).
      const liveEditorHtml = editorRef.current?.getContent() ?? description;
      const orderedContent = buildOrderedContent(liveEditorHtml);

      const fd = buildFormData(orderedContent);

      // ✅ only send file if it is File (real upload)
      if (image instanceof File) {
        fd.append("image", image);
      }

      // Blog body images. Laravel receives these as content_images[].
      // Use the ref here, not React state, so Create also works if the user
      // inserts an image and immediately clicks Create Blog.
      contentImagesRef.current.forEach((file) => {
        fd.append("content_images[]", file);
      });

      // Create vs Update
      if (resolvedId) {
        // ✅ Laravel-friendly multipart update
        fd.append("_method", "PATCH");
        await updateBlog(resolvedId, fd, { forcePost: true });
      } else {
        const created = await createBlog(fd);

        try {
          await finalizeCreatedOrder(created, orderedContent);
        } catch (orderErr) {
          console.error("Could not finalize content order:", orderErr);
          alert(
            "Blog was created, but the image order could not be finalized. Open the blog and click Update to fix the order."
          );
        }
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
      submitDisabled={isReadOnly ? false : saving || !title.trim() || !hasMeaningfulContent(description) || !category.trim() || !!linkError}
    >
      {/* Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
            isReadOnly ? "bg-gray-100 cursor-not-allowed" : "border-gray-300 focus:ring-brand-500"
          }`}
        />
        <p className="text-xs text-gray-500 mt-1">{title.length}/140</p>
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <input
          name="category"
          value={category}
          onChange={(e) => !isReadOnly && setCategory(e.target.value)}
          required
          maxLength={50}
          disabled={isReadOnly}
          placeholder="e.g., Technology, Business, Lifestyle..."
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
            isReadOnly ? "bg-gray-100 cursor-not-allowed" : "border-gray-300 focus:ring-brand-500"
          }`}
        />
        <p className="text-xs text-gray-500 mt-1">{category.length}/50</p>
      </div>

      {/* Alt Text */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alt Text (for image accessibility)
        </label>
        <input
          name="alt"
          value={alt}
          onChange={(e) => !isReadOnly && setAlt(e.target.value)}
          maxLength={255}
          disabled={isReadOnly}
          placeholder="Describe the image for screen readers"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
            isReadOnly ? "bg-gray-100 cursor-not-allowed" : "border-gray-300 focus:ring-brand-500"
          }`}
        />
        <p className="text-xs text-gray-500 mt-1">{alt.length}/255</p>
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

      {/* Content images */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content Images
        </label>

        {!isReadOnly && (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-center transition-colors hover:border-brand-500">
            <svg
              className="mb-3 h-10 w-10 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2.5M16 8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="font-medium text-gray-700">Upload content images</span>
            <span className="mt-1 text-xs text-gray-500">You can select more than one image</span>
            <input
              type="file"
              name="content_images[]"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                addImagesAtEditorCursor(files);
                e.target.value = "";
              }}
            />
          </label>
        )}

        {(existingContentImages.length > 0 || contentImages.length > 0) && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {existingContentImages.map((src, index) => (
              <div key={`existing-${src}-${index}`} className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <img
                  src={src}
                  alt={`Content ${index + 1}`}
                  className="h-28 w-full object-cover"
                />
                <div className="px-2 py-1.5 text-center text-xs text-gray-500">Saved image</div>
              </div>
            ))}

            {contentImages.map((file, index) => {
              const previewUrl = URL.createObjectURL(file);
              return (
                <div key={`${file.name}-${file.lastModified}-${index}`} className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="h-28 w-full object-cover"
                    onLoad={() => URL.revokeObjectURL(previewUrl)}
                  />
                  <div className="truncate px-2 py-1.5 text-xs text-gray-600" title={file.name}>
                    {file.name}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-2 text-xs text-gray-500">
          Images are uploaded as <code>content_images[]</code> and inserted at the current editor cursor, so the saved order stays exactly the same. To remove an image, delete it directly from the editor.
        </p>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content *
        </label>
        <Editor
          apiKey={apiKey}
          onInit={(_, editor) => {
            editorRef.current = editor;
          }}
          value={description}
          onEditorChange={(html) => !isReadOnly && setDesc(html)}
          init={{
            height: 520,
            menubar: false,
            readonly: isReadOnly ? 1 : 0,
            plugins:
              "anchor autolink charmap code codesample directionality emoticons link lists media preview searchreplace table visualblocks wordcount",
            toolbar: isReadOnly
              ? "preview | code"
              : "undo redo | blocks | bold italic underline strikethrough | align bullist numlist outdent indent | link contentimage media table | removeformat | ltr rtl | code preview",
            setup: (editor) => {
              // Use the same upload flow as the Content Images field.
              // No image URL/src dialog is shown.
              editor.ui.registry.addButton("contentimage", {
                icon: "image",
                tooltip: "Upload content image",
                enabled: !isReadOnly,
                onAction: () => {
                  if (isReadOnly) return;

                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.multiple = true;

                  input.onchange = () => {
                    const files = Array.from(input.files || []);
                    if (!files.length) return;
                    addImagesAtEditorCursor(files);
                  };

                  input.click();
                },
              });
            },
            convert_urls: false,
            // Content image size inside the editor. Change --blog-img-max to
            // make images bigger/smaller (it should match the site later).
            content_style: `
              :root{--blog-img-max:480px;}
              body{font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif; font-size:15px; line-height:1.7;}
              .blog-content-image{margin:16px auto; text-align:center;}
              .blog-content-image img,
              img{display:block; max-width:min(100%, var(--blog-img-max)); width:auto; height:auto; margin:0 auto; border-radius:8px;}
              iframe,video,table{max-width:100%;}
            `,
          }}
        />
      </div>
    </AdminForm>
  );
}
