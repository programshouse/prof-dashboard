import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/button/Button";
import Toaster, { notify } from "../../components/ui/Toaster/Toaster";
import { useToolsStore } from "../../stores/useToolsStore";

const getApiId = (t) => t?.id ?? t?._id ?? t?.uuid ?? null;

const ORIGIN = "https://www.programshouse.com";
const makeAbsolute = (path) => {
  if (!path) return "";
  if (/^(https?:|data:|\/\/)/i.test(path)) return path;
  if (path.startsWith("/")) return `${ORIGIN}${path}`;
  return `${ORIGIN}/storage/${path}`;
};

export default function ToolList({ onEdit, onAdd }) {
  const navigate = useNavigate();

  const tools = useToolsStore((s) => s.tools) || [];
  const loading = useToolsStore((s) => s.loading);
  const error = useToolsStore((s) => s.error);
  const fetchTools = useToolsStore((s) => s.fetchTools);
  const removeTool = useToolsStore((s) => s.deleteTool);

  const [deletingIds, setDeletingIds] = useState(new Set());

  useEffect(() => {
    fetchTools().catch((err) => {
      console.error("fetchTools error", err);
      notify.action("fetch").error("Failed to load tools");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gotoForm = (id, { readonly = false } = {}) => {
    const params = new URLSearchParams();
    if (id) params.set("id", id);
    if (readonly) params.set("readonly", "1");
    navigate(`/tools/form${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleShow = (tool) => {
    const id = getApiId(tool);
    if (!id) { notify.action("open").error("Missing tool id"); return; }
    gotoForm(id, { readonly: true });
  };

  const handleEdit = (tool) => {
    const id = getApiId(tool);
    if (!id) { notify.action("edit").error("Missing tool id"); return; }
    if (onEdit) { onEdit(tool); return; }
    gotoForm(id);
  };

  const handleDelete = async (tool) => {
    const id = getApiId(tool);
    if (!id) { notify.action("delete").error("Missing tool id"); return; }
    if (!window.confirm(`Are you sure you want to delete "${tool?.title || "Tool"}"?`)) return;

    try {
      setDeletingIds((p) => new Set(p).add(id));
      await removeTool(id);
      notify.action("delete").success(`Deleted: ${tool?.title || "Tool"}`);
    } catch (err) {
      console.error(err);
      notify.action("delete").error(err?.response?.data?.message || "Failed to delete tool");
    } finally {
      setDeletingIds((p) => { const n = new Set(p); n.delete(id); return n; });
    }
  };

  if (loading && tools.length === 0) {
    return (
      <PageLayout title="Tools Management | ProfMSE">
        <PageHeader title="Tools Management" description="Manage tools that appear on the website" />
        <div className="col-span-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-24 rounded bg-gray-200" />
              <div className="h-10 w-full rounded bg-gray-200" />
            </div>
            <p className="mt-2 text-gray-600 ">Loading tools...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const AddButton = ({ className, children }) =>
    onAdd ? (
      <button type="button" onClick={onAdd} className={className}>{children}</button>
    ) : (
      <Link to="/tools/form"><button type="button" className={className}>{children}</button></Link>
    );

  return (
    <PageLayout title="Tools Management | ProfMSE">
      <Toaster position="bottom-right" />

      <div className="col-span-12">
        <PageHeader title="Tools Management" description="Manage tools that appear on the website" />

        <div className="flex justify-end mb-4">
          <AddButton className="bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            + Add New Tool
          </AddButton>
        </div>

        {error && (
          <div className="text-center text-red-600 mb-4">
            Failed to load tools. Check console & network tab.
          </div>
        )}

        {!error && tools.length === 0 ? (
          <div className="text-center text-brand-600">
            <p className="mb-3">No tools found.</p>
            <AddButton className="text-brand-700 underline">Create your first tool →</AddButton>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-brand-200 bg-white shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-brand-25">
                <tr className="text-left border-b border-brand-200">
                  <th className="py-3 px-4 font-semibold text-brand-700">Image</th>
                  <th className="py-3 px-4 font-semibold text-brand-700">Title</th>
                  <th className="py-3 px-4 font-semibold text-brand-700">Description</th>
                  <th className="py-3 px-4 font-semibold text-brand-700">Link</th>
                  <th className="py-3 px-4 font-semibold text-brand-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => {
                  const id = getApiId(tool);
                  const title = tool?.title ?? "Untitled Tool";
                  const desc = (tool?.description ?? "—").toString();
                  const img = makeAbsolute(tool?.image || "");
                  const isDeleting = id ? deletingIds.has(id) : false;

                  return (
                    <tr key={id || title} className="border-b last:border-b-0 border-brand-200 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {img ? (
                          <a href={img} target="_blank" rel="noreferrer" title="Open image">
                            <img
                              src={img}
                              alt={title}
                              className="h-10 w-10 rounded object-cover border border-gray-200"
                              onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                            />
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{title}</td>
                      <td className="py-3 px-4">
                        <div className="max-w-[720px] line-clamp-2" title={desc}>{desc}</div>
                      </td>
                      <td className="py-3 px-4">
                        {tool?.link ? (
                          <a href={tool.link} target="_blank" rel="noreferrer" className="text-brand-600 underline break-all">
                            Open
                          </a>
                        ) : ("—")}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="primary" onClick={() => handleShow(tool)} disabled={!id}>Show</Button>
                          <Button variant="update" onClick={() => handleEdit(tool)} disabled={!id}>Edit</Button>
                          <Button variant="delete" onClick={() => handleDelete(tool)} disabled={!id || isDeleting}>
                            {isDeleting ? "Deleting…" : "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
