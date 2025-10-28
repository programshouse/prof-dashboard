import React, { useState, useEffect } from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import AdminTable from "../../components/ui/AdminTable";
import { servicesAPI } from "../../services/api";

export default function ServiceList({ onEdit, onAdd }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getAll();
      setServices(response.data);
    } catch (error) {
      console.error("Error loading services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (service) => {
    if (window.confirm(`Are you sure you want to delete "${service.title}"?`)) {
      try {
        await servicesAPI.delete(service.id);
        loadServices();
      } catch (error) {
        console.error("Error deleting service:", error);
        alert("Error deleting service. Please try again.");
      }
    }
  };

  const columns = [
    {
      key: "title",
      header: "Title"
    },
    {
      key: "description",
      header: "Description",
      render: (service) => (
        <div className="max-w-xs truncate" title={service.description}>
          {service.description}
        </div>
      )
    },
    {
      key: "image",
      header: "Image",
      render: (service) => (
        service.image ? (
          <img
            src={typeof service.image === 'string' ? service.image : URL.createObjectURL(service.image)}
            alt={service.title}
            className="w-16 h-16 object-cover rounded-lg"
          />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        )
      )
    }
  ];

  if (loading) {
    return (
      <PageLayout title="Services Management | ProfMSE">
        <PageHeader title="Services Management" description="Manage services that appear on the website" />
        <div className="col-span-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading services...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Services Management | ProfMSE">
      <PageHeader title="Services Management" description="Manage services that appear on the website" />
      <div className="col-span-12">
        <AdminTable
          title="Services"
          data={services}
          columns={columns}
          onEdit={onEdit}
          onDelete={handleDelete}
          onAdd={onAdd}
          addText="Add New Service"
        />
      </div>
    </PageLayout>
  );
}
