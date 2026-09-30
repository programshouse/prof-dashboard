import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SubscriberList from "./subscriberList";
import SubscriberForm from "./subscriberForm";

export default function Subscribers() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const isForm = location.pathname.includes('/form') || showForm;

  const onAdd = () => { setEditingItem(null); setShowForm(true); };
  const onEdit = (subscriber) => { setEditingItem(subscriber); setShowForm(true); };
  const onSuccess = () => { setShowForm(false); setEditingItem(null);
    // Leave the /form URL so Close / Cancel really close the form
    navigate("/subscribers");
  };

  if (isForm) {
    return (
      <SubscriberForm 
        subscriberId={editingItem?.id}
        initialValues={editingItem}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <SubscriberList onAdd={onAdd} onEdit={onEdit} />
  );
}
