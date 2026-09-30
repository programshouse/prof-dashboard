import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ServiceForm from "./ServiceForm";
import ServiceList from "./ServiceList";

// Helper to read a generic id property
const getId = (x) => x?.id ?? x?._id ?? x?.uuid ?? null;

export default function Services() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // If we navigated to /services/form, or opened inline via state
  const isForm = location.pathname.includes("/services/form") || showForm;

  const handleEdit = (service) => {
    setEditingService(service || null);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingService(null);
    // Leave the /form URL so Close / Cancel really close the form
    navigate("/services");
  };

  if (isForm) {
    return (
      <ServiceForm
        serviceId={getId(editingService)}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return <ServiceList onEdit={handleEdit} onAdd={handleAdd} />;
}
