import React, { useState, useEffect } from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import AdminForm from "../../components/ui/AdminForm";
import FileUpload from "../../components/ui/FileUpload";
import { servicesAPI } from "../../services/api";

export default function ServiceForm({ serviceId, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null
  });
  const [loading, setLoading] = useState(!!serviceId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (serviceId) {
      loadService();
    }
  }, [serviceId]);

  const loadService = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getById(serviceId);
      setFormData(response.data);
    } catch (error) {
      console.error("Error loading service:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0] || null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (serviceId) {
        await servicesAPI.update(serviceId, formData);
      } else {
        await servicesAPI.create(formData);
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Error saving service. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (onSuccess) onSuccess();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Loading service...</p>
      </div>
    );
  }

  return (
    <AdminForm
      title={serviceId ? "Edit Service" : "Add New Service"}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitText={saving ? "Saving..." : (serviceId ? "Update Service" : "Create Service")}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Service Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
      </div>

      <div>
        <FileUpload
          label="Service Image"
          name="image"
          value={formData.image}
          onChange={handleFileChange}
          accept="image/*"
        />
      </div>
    </AdminForm>
  );
}
