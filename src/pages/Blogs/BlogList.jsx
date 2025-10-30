import React, { useEffect, useState } from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import AdminTable from "../../components/ui/AdminTable";
import Toaster, { notify } from "../../components/ui/Toaster/Toaster";
import { useBlogsStore } from "../../stores/useBlogStore.js";

// tiny helper
const getId = (x) => x?.id ?? x?._id ?? x?.uuid ?? null;

export default function BlogList({ onEdit, onAdd }) {
  const blogs   = useBlogsStore((s) => s.Blogs) || [];
  const loading = useBlogsStore((s) => s.loading);
  const error   = useBlogsStore((s) => s.error);

  const fetchBlogs  = useBlogsStore((s) => s.fetchBlogs);
  const deleteBlog  = useBlogsStore((s) => s.deleteBlog);

  const [deleting, setDeleting] = useState(new Set());

  useEffect(() => {
    fetchBlogs().catch((e) => {
      console.error(e);
      notify.action("fetch").error("Failed to load blogs");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    } catch (error) {
      console.error("Error deleting blog:", error);
      notify.action("delete").error(error?.response?.data?.message || "Error deleting blog");
    } finally {
      setDeleting((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    }
  };

  const columns = [
    { key: "title", header: "Title" },
    {
      key: "description",
      header: "Content Preview",
      render: (row) => (
        <div className="max-w-xs truncate" title={row.description}>
          {(row.description || "").replace(/<[^>]*>/g, "").substring(0, 100)}…
        </div>
      ),
    },
    {
      key: "link",
      header: "Link",
      render: (row) =>
        row.link ? (
          <a
            href={row.link}
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 hover:underline break-all"
            title={row.link}
          >
            {row.link}
          </a>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: "image",
      header: "Image",
      render: (row) =>
        row.image ? (
          <img
            src={typeof row.image === "string" ? row.image : ""}
            alt={row.title}
            className="w-16 h-16 object-cover rounded-lg"
          />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        ),
    },
  ];

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
      <div className="col-span-12">
        <AdminTable
          title="Blog Posts"
          data={blogs}
          columns={columns}
          onEdit={(row) => (onEdit ? onEdit(row) : null)}
          onDelete={(row) => handleDelete(row)}
          onAdd={onAdd}
          addText="Add New Blog Post"
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
