import React from "react";

const PageCard = ({ 
  title, 
  description, 
  children, 
  className = "" 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {title}
        </h2>
      )}
      {description && (
        <p className="text-gray-600 mb-4">
          {description}
        </p>
      )}
      {children}
    </div>
  );
};

export default PageCard;
