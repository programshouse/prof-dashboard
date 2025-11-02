import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/button/Button";
import Toaster, { notify } from "../../components/ui/Toaster/Toaster";
import { useServicesStore } from "../../stores/useServicesStore";

const getApiId = (svc) => svc?.id ?? svc?._id ?? svc?.uuid ?? null;

const ORIGIN = "https://www.programshouse.com";
const makeAbsolute = (path) => {
  if (!path) return "";
  if (/^(https?:|data:|\/\/)/i.test(path)) return path;
  if (path.startsWith("/")) return `${ORIGIN}${path}`;
  return `${ORIGIN}/storage/${path}`;
};

export default function ServiceList({ onEdit, onAdd }) {
  const navigate = useNavigate();

  const services = useServicesStore((s) => s.services) || [];
  const loading  = useServicesStore((s) => s.loading);
  const error    = useServicesStore((s) => s.error);

  const fetchServices = useServicesStore((s) => s.fetchServices);
  const removeService = useServicesStore((s) => s.deleteService);

  const [deletingIds, setDeletingIds] = useState(new Set());

  useEffect(() => {
    fetchServices().catch((err) => {
      console.error("fetchServices error", err);
      notify.action("fetch").error("Failed to load services");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gotoForm = (id, { readonly = false } = {}) => {
    const params = new URLSearchParams();
    if (id) params.set("id", id);
    if (readonly) params.set("readonly", "1");
    navigate(`/services/form${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleShow = (svc) => {
    const id = getApiId(svc);
    if (!id) { notify.action("open").error("Missing service id"); return; }
    gotoForm(id, { readonly: true });
  };

  const handleEdit = (svc) => {
    const id = getApiId(svc);
    if (!id) { notify.action("edit").error("Missing service id"); return; }
    if (onEdit) { onEdit(svc); return; }
    gotoForm(id, { readonly: false });
  };

  const handleDelete = async (svc) => {
    const id = getApiId(svc);
    if (!id) { notify.action("delete").error("Missing service id"); return; }
    if (!window.confirm(`Are you sure you want to delete "${svc?.title || "Service"}"?`)) return;

    try {
      setDeletingIds((p) => new Set(p).add(id));
      await removeService(id);
      notify.action("delete").success(`Deleted: ${svc?.title || "Service"}`);
    } catch (err) {
      console.error(err);
      notify.action("delete").error(err?.response?.data?.message || "Failed to delete service");
    } finally {
      setDeletingIds((p) => { const n = new Set(p); n.delete(id); return n; });
    }
  };

  if (loading) {
    return (
      <PageLayout title="Services Management | ProfMSE">
        <PageHeader title="Services Management" description="Manage services that appear on the website" />
        <main className="px-4 pb-24">
          <div className="overflow-hidden rounded-xl border border-brand-200 bg-white shadow">
            <div className="p-6 animate-pulse space-y-3">
              <div className="h-5 w-24 rounded bg-gray-200" />
              <div className="h-10 w-full rounded bg-gray-200" />
            </div>
          </div>
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Services Management | ProfMSE">
      <Toaster position="bottom-right" />

      <PageHeader
        title="Services Management"
        description="Manage services that appear on the website"
      >
        {/* TOP-RIGHT ADD NEW BUTTON */}
        {onAdd ? (
          <Button onClick={onAdd} variant="primary">+ Add New Service</Button>
        ) : (
          <Link to="/services/form">
            <Button variant="primary">+ Add New Service</Button>
          </Link>
        )}
      </PageHeader>

      <main className="px-4 pb-24" style={{ minWidth: "1400px" }}>
        {error && (
          <div className="text-center text-red-600 mb-4">
            Failed to load services. Check console & network tab.
          </div>
        )}

        {!error && (!services || services.length === 0) ? (
          <div className="text-center text-brand-600">
            <p className="mb-3">No services found.</p>
            {onAdd ? (
              <button className="text-brand-700 underline" onClick={onAdd} type="button">
                Create your first service →
              </button>
            ) : (
              <Link to="/services/form" className="text-brand-700 underline">
                Create your first service →
              </Link>
            )}
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
                {(services || []).map((svc) => {
                  const id    = getApiId(svc);
                  const title = svc?.title ?? svc?.name ?? "Untitled Service";
                  const desc  = (svc?.description ?? svc?.description_en ?? svc?.description_ar ?? "—").toString();
                  const img   = makeAbsolute(svc?.image || "");
                  const isDeleting = id ? deletingIds.has(id) : false;

                  return (
                    <tr key={id || title} className="border-b last:border-b-0 border-brand-200 py-6 hover:bg-gray-50">
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
                        {svc?.link ? (
                          <a href={svc.link} target="_blank" rel="noreferrer" className="text-brand-600 underline break-all">
                            Open
                          </a>
                        ) : ("—")}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="primary" onClick={() => handleShow(svc)} disabled={!id}>Show</Button>
                          <Button variant="update" onClick={() => handleEdit(svc)} disabled={!id}>Edit</Button>
                          <Button variant="delete" onClick={() => handleDelete(svc)} disabled={!id || isDeleting}>
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
      </main>
    </PageLayout>
  );
}
