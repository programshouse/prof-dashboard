import React from "react";

const BlogCard = ({ 
  title, 
  description, 
  image = null,
  category = "",
  className = "" 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* Image Section */}
      <div className="w-full h-48">
        {image ? (
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {category && (
          <span className="inline-block bg-brand-100 text-brand-600 text-sm font-medium px-3 py-1 rounded-full mb-3">
            {category}
          </span>
        )}
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {title}
        </h3>
        <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
          {description}
        </p>
        <button className="text-brand-500 hover:text-brand-600 font-medium transition-colors">
          Start Reading →
        </button>
      </div>
    </div>
  );
};

export default BlogCard;
