import React, { useEffect, useState } from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import AdminTable from "../../components/ui/AdminTable";
import Toaster, { notify } from "../../components/ui/Toaster/Toaster";
import { useWorkshopStore } from "../../stores/useWorkshopStore";

// id helper
const getId = (x) => x?.id ?? x?._id ?? x?.uuid ?? null;

export default function WorkshopList({ onEdit, onAdd }) {
  const workshops = useWorkshopStore((s) => s.workshops) || [];
  const loading   = useWorkshopStore((s) => s.loading);
  const error     = useWorkshopStore((s) => s.error);

  // IMPORTANT: use the exact method names from your store
  const fetchworkshops = useWorkshopStore((s) => s.fetchworkshops);
  const deleteworkshop = useWorkshopStore((s) => s.deleteworkshop);

  const [deleting, setDeleting] = useState(new Set());

  useEffect(() => {
    fetchworkshops().catch((e) => {
      console.error(e);
      notify.action("fetch").error("Failed to load workshops");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (workshop) => {
    const id = getId(workshop);
    if (!id) {
      notify.action("delete").error("Missing workshop id");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${workshop?.title || "Workshop"}"?`)) return;

    try {
      setDeleting((prev) => new Set(prev).add(id));
      await deleteworkshop(id);
      notify.action("delete").success("Workshop deleted");
    } catch (error) {
      console.error("Error deleting workshop:", error);
      notify.action("delete").error(error?.response?.data?.message || "Error deleting workshop");
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
      header: "Description",
      render: (row) => (
        <div className="max-w-xs truncate" title={row.description}>
          {row.description}
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
      key: "media",
      header: "Media",
      render: (row) => (
        <div className="flex gap-2">
          {row.video && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Video
            </span>
          )}
          {row.image && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Image
            </span>
          )}
          {!row.video && !row.image && <span className="text-gray-400 text-xs">None</span>}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <PageLayout title="Workshop Management | ProfMSE">
        <PageHeader title="Workshop Management" description="Manage workshops that appear on the website" />
        <div className="col-span-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto" />
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading workshops...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Workshop Management | ProfMSE">
      <Toaster position="bottom-right" />

      <PageHeader title="Workshop Management" description="Manage workshops that appear on the website" />

      <div className="col-span-12">
        <AdminTable
          title="Workshops"
          data={workshops}
          columns={columns}
          onEdit={(row) => (onEdit ? onEdit(row) : null)}
          onDelete={(row) => handleDelete(row)}
          onAdd={onAdd}
          addText="Add New Workshop"
          isRowActionDisabled={(row) => {
            const id = getId(row);
            return !id || deleting.has(id);
          }}
          getRowKey={(row) => getId(row) || row?.title}
        />
      </div>

      {error && (
        <div className="mt-4 text-center text-sm text-red-600">
          {String(error)}
        </div>
      )}
    </PageLayout>
  );
}
