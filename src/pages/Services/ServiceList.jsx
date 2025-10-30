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
      // Let parent render the form with initial data
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
      await removeService(apiId); // store supports deleteService(id)
      notify.action("delete").success(`Deleted: ${svc?.title || "Service"}`);
    } catch (err) {
      console.error(err);
      notify
        .action("delete")
        .error(err?.response?.data?.message || "Failed to delete service");
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
        <div className="mx-auto max-w-7xl px-4 grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 rounded-lg border bg-white dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
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
      <div className="mx-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4 -mt-4 mb-4 text-xs text-gray-500">
        count: {Array.isArray(services) ? services.length : 0}
        {error ? ` • error: ${String(error)}` : ""}
      </div>

      <main className="mx-auto max-w-7xl px-4 pb-24">
        {!error && (!services || services.length === 0) && (
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
        )}

        {error && (
          <div className="text-center text-red-600">
            Failed to load services. Check console & network tab.
          </div>
        )}

        {/* Responsive grid with min card width */}
        <section className="mt-6 grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {(services || []).map((svc) => {
            const apiId   = getApiId(svc);
            const routeId = getRouteId(svc);
            const title   = svc?.title ?? svc?.name ?? "Untitled Service";
            const desc    = svc?.description ?? svc?.description_en ?? svc?.description_ar ?? "No description";
            const img     = makeImageUrl(typeof svc?.image === "string" ? svc.image : (svc?.images?.[0] || null));
            const isDeleting = apiId ? deletingIds.has(apiId) : false;

            return (
              <ServiceCard
                key={apiId || routeId || title}
                title={title}
                description={desc}
                image={img}
                link={svc?.link}
                className="w-full"
                primaryAction={{
                  label: "Show",
                  onClick: () => handleShow(svc),
                  disabled: !routeId,
                }}
                secondaryAction={{
                  label: "Edit",
                  onClick: () => handleEdit(svc),
                  disabled: !apiId,
                }}
                dangerAction={{
                  label: isDeleting ? "Deleting…" : "Delete",
                  onClick: () => handleDelete(svc),
                  disabled: !apiId || isDeleting,
                }}
              />
            );
          })}
        </section>
      </main>
    </PageLayout>
  );
}
