import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BlogFormTiny from "./BlogForm";
import BlogList from "./BlogList";

export default function Blogs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  const isForm = location.pathname.includes("/form") || showForm;

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingBlog(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingBlog(null);
    // Leave the /form URL so Close / Cancel really close the form
    navigate("/blogs");
  };

  if (isForm) {
    return <BlogFormTiny blogId={editingBlog?.id} onSuccess={handleFormSuccess} />;
  }

  return <BlogList onEdit={handleEdit} onAdd={handleAdd} />;
}
