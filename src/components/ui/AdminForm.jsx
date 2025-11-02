import React from "react";

const AdminForm = ({ 
  title, 
  children, 
  onSubmit, 
  onCancel,
  submitText = "Save",
  cancelText = "Cancel",
  className = "",
  extraActions = null,
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {title}
      </h2>
      
      <form onSubmit={onSubmit} className="space-y-6">
        {children}
        
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            className="bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {submitText}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          {extraActions}
        </div>
      </form>
    </div>
  );
};

export default AdminForm;
