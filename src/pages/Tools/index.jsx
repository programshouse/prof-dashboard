import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import ToolForm from "./ToolForm";
import ToolList from "./ToolList";

const getId = (x) => x?.id ?? x?._id ?? x?.uuid ?? null;

export default function Tools() {
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingTool, setEditingTool] = useState(null);

  // /tools/form (create / edit / view via ?id=&readonly=1) or opened inline
  const isForm = location.pathname.includes("/tools/form") || showForm;

  const handleEdit = (tool) => {
    setEditingTool(tool || null);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingTool(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTool(null);
  };

  if (isForm) {
    return <ToolForm toolId={getId(editingTool)} onSuccess={handleFormSuccess} />;
  }

  return <ToolList onEdit={handleEdit} onAdd={handleAdd} />;
}
