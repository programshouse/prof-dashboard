import React, { useState, useEffect } from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import AdminTable from "../../components/ui/AdminTable";
import { workshopsAPI } from "../../services/api";

export default function WorkshopList({ onEdit, onAdd }) {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkshops();
  }, []);

  const loadWorkshops = async () => {
    try {
      setLoading(true);
      const response = await workshopsAPI.getAll();
      setWorkshops(response.data);
    } catch (error) {
      console.error("Error loading workshops:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workshop) => {
    if (window.confirm(`Are you sure you want to delete "${workshop.title}"?`)) {
      try {
        await workshopsAPI.delete(workshop.id);
        loadWorkshops();
      } catch (error) {
        console.error("Error deleting workshop:", error);
        alert("Error deleting workshop. Please try again.");
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
      render: (workshop) => (
        <div className="max-w-xs truncate" title={workshop.description}>
          {workshop.description}
        </div>
      )
    },
    {
      key: "duration",
      header: "Duration"
    },
    {
      key: "media",
      header: "Media",
      render: (workshop) => (
        <div className="flex gap-2">
          {workshop.video && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Video
            </span>
          )}
          {workshop.image && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Image
            </span>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <PageLayout title="Workshop Management | ProfMSE">
        <PageHeader title="Workshop Management" description="Manage workshops that appear on the website" />
        <div className="col-span-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading workshops...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Workshop Management | ProfMSE">
      <PageHeader title="Workshop Management" description="Manage workshops that appear on the website" />
      <div className="col-span-12">
        <AdminTable
          title="Workshops"
          data={workshops}
          columns={columns}
          onEdit={onEdit}
          onDelete={handleDelete}
          onAdd={onAdd}
          addText="Add New Workshop"
        />
      </div>
    </PageLayout>
  );
}
