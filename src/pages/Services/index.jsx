// insex.jsx for services page

import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import ServiceForm from "./ServiceForm";
import ServiceList from "./ServiceList";

export default function Services() {
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const isForm = location.pathname.includes('/form') || showForm;

  const handleEdit = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingService(null);
  };

  if (isForm) {
    return (
      <ServiceForm 
        serviceId={editingService?.id} 
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <ServiceList 
      onEdit={handleEdit}
      onAdd={handleAdd}
    />
  );
}
