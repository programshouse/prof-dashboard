import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileForm from "./ProfileForm";
import ProfileList from "./ProfileList";

export default function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const isForm = location.pathname.includes('/form') || showForm;

  const handleEdit = () => {
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    // Leave the /form URL so Close / Cancel really close the form
    navigate("/who-am-i");
  };

  if (isForm) {
    return <ProfileForm onSuccess={handleFormSuccess} />;
  }

  return <ProfileList onEdit={handleEdit} />;
}
