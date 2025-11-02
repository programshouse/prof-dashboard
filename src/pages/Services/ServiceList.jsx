// /src/pages/Services/ServiceList.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/button/Button";
import Toaster, { notify } from "../../components/ui/Toaster/Toaster";
import { useServicesStore } from "../../stores/useServicesStore";
import ServiceCard from "../../components/ui/ServiceCard";

// Build absolute URLs when API returns relative image paths
const makeImageUrl = (path) => {
  if (!path) return null;
  if (/^(https?:|data:|\/\/)/i.test(path)) return path;
  return `https://www.programshouse.com${path.startsWith("/") ? path : `/${path}`}`;
};

// ID helpers
const getApiId = (svc) => svc?.id ?? svc?._id ?? svc?.uuid ?? null; // for API calls
const getRouteId = (svc) => getApiId(svc) ?? (typeof svc?.slug === "string" ? svc.slug : null); // for /services/:id

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

  const handleShow = (svc) => {
    const routeId = getRouteId(svc);
    if (!routeId) {
      notify.action("open").error("Missing service identifier");
      return;
    }
    navigate(`/services/${routeId}`);
  };

  const handleEdit = (svc) => {
    const apiId = getApiId(svc);
    if (onEdit) {
      onEdit(svc);
      return;
    }
    if (!apiId) {
      notify.action("edit").error("Missing service id");
      return;
    }
    navigate(`/services/form?id=${apiId}`);
  };

  const handleDelete = async (svc) => {
    const apiId = getApiId(svc);
    if (!apiId) {
      notify.action("delete").error("Missing service id");
      return;
    }
    try {
      setDeletingIds((prev) => new Set(prev).add(apiId));
      await removeService(apiId);
      notify.action("delete").success(`Deleted: ${svc?.title || "Service"}`);
    } catch (err) {
      console.error(err);
      notify.action("delete").error(err?.response?.data?.message || "Failed to delete service");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(apiId);
        return next;
      });
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
        {onAdd ? (
          <Button onClick={onAdd} variant="primary">+ Add New Service</Button>
        ) : (
          <Link to="/services/form">
            <Button variant="primary">+ Add New Service</Button>
          </Link>
        )}
      </PageHeader>

      {/* tiny debug strip — remove in prod */}
      <div className="px-4 -mt-4 mb-4 text-xs text-gray-500">
        count: {Array.isArray(services) ? services.length : 0}
        {error ? ` • error: ${String(error)}` : ""}
      </div>

      {/* Table list like Session Plans */}
      <main className="w-full px-4 pb-24">
        {error && (
          <div className="text-center text-red-600 mb-4">Failed to load services. Check console & network tab.</div>
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
                  <th className="py-3 px-4 font-semibold text-brand-700">Title</th>
                  <th className="py-3 px-4 font-semibold text-brand-700">Description</th>
                  <th className="py-3 px-4 font-semibold text-brand-700">Link</th>
                  <th className="py-3 px-4 font-semibold text-brand-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(services || []).map((svc) => {
                  const apiId   = getApiId(svc);
                  const routeId = getRouteId(svc);
                  const title   = svc?.title ?? svc?.name ?? "Untitled Service";
                  const desc    = (svc?.description ?? svc?.description_en ?? svc?.description_ar ?? "—").toString();
                  const link    = svc?.link || "—";
                  const isDeleting = apiId ? deletingIds.has(apiId) : false;

                  return (
                    <tr key={apiId || routeId || title} className="border-b last:border-b-0 border-brand-200 py-6 hover:bg-gray-50">
                      <td className="py-3 px-4">{title}</td>
                      <td className="py-3 px-4">{desc}</td>
                      <td className="py-3 px-4">
                        {svc?.link ? (
                          <a href={svc.link} target="_blank" rel="noreferrer" className="text-brand-600 underline">Open</a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="primary" onClick={() => handleShow(svc)} disabled={!routeId}>Show</Button>
                          <Button variant="update" onClick={() => handleEdit(svc)} disabled={!apiId}>Edit</Button>
                          <Button variant="delete" onClick={() => handleDelete(svc)} disabled={!apiId || isDeleting}>
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
