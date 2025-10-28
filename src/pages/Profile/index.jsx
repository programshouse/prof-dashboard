import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import ProfileForm from "./ProfileForm";
import ProfileList from "./ProfileList";

export default function Profile() {
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);

  const isForm = location.pathname.includes('/form') || showForm;

  const handleEdit = () => {
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
  };

  if (isForm) {
    return <ProfileForm onSuccess={handleFormSuccess} />;
  }

  return <ProfileList onEdit={handleEdit} />;
}
