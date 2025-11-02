// /src/pages/Profile/ProfileList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/button/Button";
import AdminTable from "../../components/ui/AdminTable";
import { useWhoAmIStore } from "../../stores/useWhoAmIStore";

const getId = (x) => x?.id ?? x?._id ?? null;

export default function ProfileList({ onEdit }) {
  const navigate = useNavigate();

  const fetchAll = useWhoAmIStore((s) => s.fetchAll);
  const destroy  = useWhoAmIStore(
    (s) => s.delete ?? s.remove ?? s.deleteOne ?? s.destroy
  );

  const [rows, setRows] = useState([]);  // support multiple later; uses first when single
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await fetchAll();
        const data = Array.isArray(list) ? list : (list ? [list] : []);
        setRows(data);
      } catch (e) {
        console.error("Error loading profiles:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchAll]);

  const handleShow = (row) => {
    navigate(`/profile/form${getId(row) ? `?id=${getId(row)}` : ""}&readonly=1`);
  };

  const handleEdit = (row) => {
    if (onEdit) return onEdit(row);
    navigate(`/profile/form${getId(row) ? `?id=${getId(row)}` : ""}`);
  };

  const handleDelete = async (row) => {
    const id = getId(row);
    if (!id || !destroy) {
      alert("Delete not wired yet.");
      return;
    }
    if (!window.confirm("Delete this profile?")) return;
    try {
      setDeleting((prev) => new Set(prev).add(id));
      await destroy(id);
      setRows((prev) => prev.filter((r) => getId(r) !== id));
    } finally {
      setDeleting((prev) => {
        const n = new Set(prev); n.delete(id); return n;
      });
    }
  };

  const columns = useMemo(() => [
    {
      key: "title",
      header: "Name",
      render: (row) => (
        <div className="min-w-0 max-w-[360px]">
          <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {row.title || "—"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            ID: <span className="font-mono">{getId(row) || "—"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Summary",
      render: (row) => {
        const t = (row.description || "").toString();
        return (
          <div className="text-gray-700 dark:text-gray-300 max-w-[520px] line-clamp-2" title={t}>
            {t || <span className="text-gray-400">—</span>}
          </div>
        );
      },
    },
    {
      key: "features",
      header: "Features",
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-md bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-900/10 dark:text-brand-300 dark:border-brand-800">
          {(row.features || []).length} items
        </span>
      ),
    },
    {
      key: "media",
      header: "Media",
      render: (row) => {
        const hasImg = !!row.image;
        const hasVid = !!row.video;
        if (!hasImg && !hasVid) return <span className="text-gray-400">—</span>;
        return (
          <div className="flex items-center gap-2">
            {hasImg && <span className="text-xs px-2 py-0.5 rounded-md border border-gray-300 dark:border-gray-700">Image</span>}
            {hasVid && <span className="text-xs px-2 py-0.5 rounded-md border border-gray-300 dark:border-gray-700">Video</span>}
          </div>
        );
      },
    },
  ], []);

  if (loading) {
    return (
      <PageLayout title="Profile List | ProfMSE">
        <div className="mx-auto w-[1400px] max-w-[1400px] px-4">
          <PageHeader title="Profile List" description="Manage your professional profile" />
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto" />
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading profiles…</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Profile List | ProfMSE">
      {/* Fixed width wrapper */}
      <div className="mx-auto w-[1400px] max-w-[1400px] px-4">
        <PageHeader title="Profile List" description="Manage your professional profile">
          {/* Top-left “Add New”: easiest is to place inside the header actions; it's visually top-right in most layouts.
              If you literally want left-aligned, add a small toolbar below header. */}
          <Link to="/profile/form">
            <Button variant="primary">+ Add New</Button>
          </Link>
        </PageHeader>

        <div className="overflow-x-auto rounded-xl border border-brand-200 bg-white dark:bg-gray-800 shadow">
          <AdminTable
            title="Profiles"
            data={rows}
            columns={columns}
            onShow={(row) => handleShow(row)}
            onEdit={(row) => handleEdit(row)}
            onDelete={(index) => rows[index] && handleDelete(rows[index])}
            addText="+ Add New"
            onAdd={() => navigate("/profile/form")}
          />
        </div>
      </div>
    </PageLayout>
  );
}
