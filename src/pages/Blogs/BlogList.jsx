// /src/pages/Blogs/BlogList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import AdminTable from "../../components/ui/AdminTable";
import Toaster, { notify } from "../../components/ui/Toaster/Toaster";
import { useBlogsStore } from "../../stores/useBlogStore.js";

// ---------- helpers ----------
const getId = (x) => x?.id ?? x?._id ?? x?.uuid ?? null;
const stripHtml = (html = "") => String(html).replace(/<[^>]*>/g, "");
const safeUrl = (url = "") => {
  try {
    const u = new URL(url);
    return /^https?:$/i.test(u.protocol) ? url : "";
  } catch {
    return "";
  }
};
const initials = (s = "") =>
  s
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

// ---------- component ----------
export default function BlogList({ onEdit, onAdd }) {
  const navigate = useNavigate();

  const blogs   = useBlogsStore((s) => s.Blogs) || [];
  const loading = useBlogsStore((s) => s.loading);
  const error   = useBlogsStore((s) => s.error);

  const fetchBlogs = useBlogsStore((s) => s.fetchBlogs);
  const deleteBlog = useBlogsStore((s) => s.deleteBlog);

  const [deleting, setDeleting] = useState(new Set());

  useEffect(() => {
    fetchBlogs().catch((e) => {
      console.error(e);
      notify.action("fetch").error("Failed to load blogs");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show: open the form in read-only mode
  const handleShow = (row) => {
    const id = getId(row);
    if (!id) {
      notify.action("open").error("Missing blog identifier");
      return;
    }
    navigate(`/blogs/form?id=${id}&readonly=1`);
  };

  const handleDelete = async (row) => {
    const id = getId(row);
    if (!id) {
      notify.action("delete").error("Missing blog id");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${row?.title || "Blog"}"?`)) return;

    try {
      setDeleting((prev) => new Set(prev).add(id));
      await deleteBlog(id);
      notify.action("delete").success("Blog deleted");
    } catch (err) {
      console.error("Error deleting blog:", err);
      notify.action("delete").error(err?.response?.data?.message || "Error deleting blog");
    } finally {
      setDeleting((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    }
  };

  // Columns: Post (icon+title+id+Visit), Category, Content preview, Link chip, Icon thumb
  const columns = useMemo(() => [
    {
      key: "title",
      header: "Post",
      render: (row) => {
        const icon = row.icon ?? row.image ?? null;
        const iconUrl = typeof icon === "string" ? icon : "";
        const id = getId(row);
        const t = row?.title || "Untitled";
        const l = safeUrl(row?.link || "");
        return (
          <div className="flex items-center gap-3 max-w-xl">
            <div className="relative shrink-0">
              {iconUrl ? (
                <img
                  src={iconUrl}
                  alt={t}
                  className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {initials(t)}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 dark:text-white truncate" title={t}>
                {t}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                ID: {id || "—" }
              </div>
            </div>
            {l && (
              <a
                href={l}
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition"
                title={l}
              >
                Visit
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            )}
          </div>
        );
      },
    },
    {
      key: "category",
      header: "Category",
      render: (row) => {
        const category = row?.category || "—";
        return (
          <div className="text-gray-700 dark:text-gray-300 max-w-xs">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {category}
            </span>
          </div>
        );
      },
    },
    // {
    //   key: "content",
    //   header: "Content Preview",
    //   render: (row) => {
    //     const html = row?.content ?? row?.description ?? "";
    //     const text = stripHtml(html);
    //     return (
    //       <div
    //         className="text-gray-700 dark:text-gray-300 max-w-2xl line-clamp-2"
    //         title={text.length > 200 ? text.slice(0, 500) : text}
    //       >
    //         {text || <span className="text-gray-400">—</span>}
    //       </div>
    //     );
    //   },
    // },
    // {
    //   key: "link",
    //   header: "Link",
    //   render: (row) => {
    //     const l = safeUrl(row?.link || "");
    //     if (!l) return <span className="text-gray-400">—</span>;
    //     return (
    //       <a
    //         href={l}
    //         target="_blank"
    //         rel="noreferrer"
    //         className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 dark:bg-brand-900/10 dark:text-brand-300 dark:border-brand-800"
    //         title={l}
    //       >
    //         {l}
    //       </a>
    //     );
    //   },
    // },
    {
      key: "icon",
      header: "Icon",
      render: (row) => {
        const icon = row.icon ?? row.image ?? null;
        const iconUrl = typeof icon === "string" ? icon : "";
        if (!iconUrl) return <span className="text-gray-400 text-sm">No icon</span>;
        return (
          <img
            src={iconUrl}
            alt={row?.title || "icon"}
            className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
          />
        );
      },
    },
  ], []);

  if (loading) {
    return (
      <PageLayout title="Blogs Management | ProfMSE">
        <PageHeader title="Blogs Management" description="Manage blog posts that appear on the website" />
        <div className="col-span-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto" />
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading blogs...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Blogs Management | ProfMSE">
      <Toaster position="bottom-right" />
      <PageHeader title="Blogs Management" description="Manage blog posts that appear on the website" />

      <div className="col-span-12 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total: <span className="font-medium text-gray-700 dark:text-gray-200">{blogs?.length || 0}</span>
          </div>
          {onAdd && (
            <button
              type="button"
              onClick={() => onAdd()}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-brand-600 text-white hover:bg-brand-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Blog Post
            </button>
          )}
        </div>
      </div>

      <div className="col-span-12">
        <AdminTable
          title="Blog Posts"
          data={blogs}
          columns={columns}
          onShow={(row) => handleShow(row)}
          onEdit={(row) =>
            onEdit ? onEdit(row) : navigate(`/blogs/form?id=${getId(row)}`)
          }
          // AdminTable calls onDelete(index) — map index -> row then call real deleter
          onDelete={(index) => blogs[index] && handleDelete(blogs[index])}
          addText="Add New Blog Post"
          // Optional props (your AdminTable can ignore them safely if not implemented)
          isRowActionDisabled={(row) => {
            const id = getId(row);
            return !id || deleting.has(id);
          }}
          getRowKey={(row) => getId(row) || row?.title}
        />
      </div>

      {error && <div className="mt-4 text-center text-sm text-red-600">{String(error)}</div>}
    </PageLayout>
  );
}
