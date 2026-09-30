import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WorkshopForm from "./WorkshopForm";
import WorkshopList from "./WorkshopList";

const getId = (x) => x?.id ?? x?._id ?? x?.uuid ?? null;

export default function Workshop() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);

  const isForm = location.pathname.includes("/form") || showForm;

  const handleEdit = (workshop) => {
    setEditingWorkshop(workshop);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingWorkshop(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingWorkshop(null);
    // Leave the /form URL so Close / Cancel really close the form
    navigate("/workshop");
  };

  if (isForm) {
    return (
      <WorkshopForm
        workshopId={getId(editingWorkshop)}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return <WorkshopList onEdit={handleEdit} onAdd={handleAdd} />;
}
