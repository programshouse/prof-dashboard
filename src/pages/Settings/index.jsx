import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import SettingsList from "./SettingsList";
import SettingsForm from "./SettingsForm";

export default function SettingsIndex() {
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);

  const isForm = location.pathname.includes('/settings/form') || showForm;

  const onEdit = () => setShowForm(true);
  const onSuccess = () => setShowForm(false);

  if (isForm) {
    return <SettingsForm onSuccess={onSuccess} />;
  }

  return <SettingsList onEdit={onEdit} />;
}
