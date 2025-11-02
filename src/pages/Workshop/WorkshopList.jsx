// /src/pages/Workshops/WorkshopList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import AdminTable from "../../components/ui/AdminTable";
import Toaster, { notify } from "../../components/ui/Toaster/Toaster";
import { useWorkshopStore } from "../../stores/useWorkshopStore";

// Helpers
const getId = (x) => x?.id ?? x?._id ?? x?.uuid ?? null;
const makeAbsolute = (path) => {
  if (!path) return null;
  if (/^(https?:|data:|\/\/)/i.test(path)) return path;
  return `https://www.programshouse.com${path.startsWith("/") ? path : `/${path}`}`;
};

export default function WorkshopList({ onEdit, onAdd }) {
  const navigate = useNavigate();

  const workshops       = useWorkshopStore((s) => s.workshops) || [];
  const loading         = useWorkshopStore((s) => s.loading);
  const error           = useWorkshopStore((s) => s.error);
  const fetchworkshops  = useWorkshopStore((s) => s.fetchworkshops);
  const deleteworkshop  = useWorkshopStore((s) => s.deleteworkshop);

  const [deleting, setDeleting] = useState(new Set());

  useEffect(() => {
    fetchworkshops().catch((e) => {
      console.error(e);
      notify.action("fetch").error("Failed to load workshops");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open form (both Show and Edit go to editable form)
  const gotoForm = (id, { readonly = false } = {}) => {
    const sp = new URLSearchParams();
    if (id) sp.set("id", id);
    // NOTE: do NOT set readonly => editable mode
    if (readonly) sp.set("readonly", "1"); // we won't pass readonly=true anymore
    navigate(`/workshops/form${sp.toString() ? `?${sp.toString()}` : ""}`);
  };

  // Show should behave like Edit now
  const handleShow = (row) => {
    const id = getId(row);
    if (!id) return notify.action("open").error("Missing workshop id");
    gotoForm(id, { readonly: false });
  };

  const handleEdit = (row) => {
    const id = getId(row);
    if (!id) return notify.action("edit").error("Missing workshop id");
    if (onEdit) return onEdit(row); // if parent overrides
    gotoForm(id, { readonly: false });
  };

  const handleDelete = async (row) => {
    const id = getId(row);
    if (!id) {
      notify.action("delete").error("Missing workshop id");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${row?.title || "Workshop"}"?`)) return;

    try {
      setDeleting((prev) => new Set(prev).add(id));
      await deleteworkshop(id);
      notify.action("delete").success("Workshop deleted");
    } catch (e) {
      console.error("Error deleting workshop:", e);
      notify.action("delete").error(e?.response?.data?.message || "Error deleting workshop");
    } finally {
      setDeleting((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    }
  };

  // Columns (with ID + media handling)
  const columns = useMemo(
    () => [
      {
        key: "title",
        header: "Title",
        render: (row) => {
          const id = getId(row);
          const title = row?.title || "Untitled";
          return (
            <div className="min-w-0 max-w-[380px]">
              {/* make title clickable to edit */}
              <button
                type="button"
                onClick={() => handleEdit(row)}
                className="font-medium text-brand-600 hover:underline truncate text-left"
                title="Open to edit"
              >
                {title}
              </button>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                ID: <span className="font-mono">{id || "—"}</span>
              </div>
            </div>
          );
        },
      },
      {
        key: "description",
        header: "Description",
        render: (row) => (
          <div className="max-w-[720px] line-clamp-2" title={row?.description || ""}>
            {row?.description || "—"}
          </div>
        ),
      },
      {
        key: "link",
        header: "Link",
        render: (row) =>
          row?.link ? (
            <a
              href={row.link}
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 hover:underline break-all"
              title={row.link}
            >
              Open
            </a>
          ) : (
            <span className="text-gray-400">—</span>
          ),
      },
      {
        key: "media",
        header: "Media",
        render: (row) => {
          const img = makeAbsolute(row?.image);
          const vid = makeAbsolute(row?.video);
          return (
            <div className="flex items-center gap-3">
              {img ? (
                <a href={img} target="_blank" rel="noreferrer" title="Open image">
                  <img
                    src={img}
                    alt={row?.title || "image"}
                    className="h-10 w-10 rounded object-cover border border-gray-200 dark:border-gray-700"
                  />
                </a>
              ) : (
                <span className="text-gray-300 text-xs">No image</span>
              )}
              {vid ? (
                <a
                  href={vid}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  title={vid}
                >
                  Video
                </a>
              ) : (
                <span className="text-gray-300 text-xs">No video</span>
              )}
            </div>
          );
        },
      },
    ],
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

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

      <PageHeader
        title="Workshop Management"
        description="Manage workshops that appear on the website"
      >
        {/* Top-right Add New */}
        {onAdd ? (
          <button
            onClick={onAdd}
            className="bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            + Add New Workshop
          </button>
        ) : (
          <Link to="/workshops/form">
            <button className="bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              + Add New Workshop
            </button>
          </Link>
        )}
      </PageHeader>

      <div className="col-span-12">
        <AdminTable
          title="Workshops"
          data={workshops}
          columns={columns}
          // Show should behave like Edit
          onShow={(row) => handleEdit(row)}
          onEdit={(row) => handleEdit(row)}
          onDelete={(index) => workshops[index] && handleDelete(workshops[index])}
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
