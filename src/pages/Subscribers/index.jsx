import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import SubscriberList from "./subscriberList";
import SubscriberForm from "./subscriberForm";

export default function Subscribers() {
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const isForm = location.pathname.includes('/form') || showForm;

  const onAdd = () => { setEditingItem(null); setShowForm(true); };
  const onEdit = (subscriber) => { setEditingItem(subscriber); setShowForm(true); };
  const onSuccess = () => { setShowForm(false); setEditingItem(null); };

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
