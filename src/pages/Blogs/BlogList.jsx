import React, { useState, useEffect } from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import AdminTable from "../../components/ui/AdminTable";
import { blogsAPI } from "../../services/api";

export default function BlogList({ onEdit, onAdd }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogsAPI.getAll();
      setBlogs(response.data);
    } catch (error) {
      console.error("Error loading blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blog) => {
    if (window.confirm(`Are you sure you want to delete "${blog.title}"?`)) {
      try {
        await blogsAPI.delete(blog.id);
        loadBlogs();
      } catch (error) {
        console.error("Error deleting blog:", error);
        alert("Error deleting blog. Please try again.");
      }
    }
  };

  const columns = [
    {
      key: "title",
      header: "Title"
    },
    {
      key: "category",
      header: "Category",
      render: (blog) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200">
          {blog.category}
        </span>
      )
    },
    {
      key: "description",
      header: "Content Preview",
      render: (blog) => (
        <div className="max-w-xs truncate" title={blog.description}>
          {blog.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
        </div>
      )
    },
    {
      key: "image",
      header: "Image",
      render: (blog) => (
        blog.image ? (
          <img
            src={typeof blog.image === 'string' ? blog.image : URL.createObjectURL(blog.image)}
            alt={blog.title}
            className="w-16 h-16 object-cover rounded-lg"
          />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        )
      )
    }
  ];

  if (loading) {
    return (
      <PageLayout title="Blogs Management | ProfMSE">
        <PageHeader title="Blogs Management" description="Manage blog posts that appear on the website" />
        <div className="col-span-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading blogs...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Blogs Management | ProfMSE">
      <PageHeader title="Blogs Management" description="Manage blog posts that appear on the website" />
      <div className="col-span-12">
        <AdminTable
          title="Blog Posts"
          data={blogs}
          columns={columns}
          onEdit={onEdit}
          onDelete={handleDelete}
          onAdd={onAdd}
          addText="Add New Blog Post"
        />
      </div>
    </PageLayout>
  );
}
