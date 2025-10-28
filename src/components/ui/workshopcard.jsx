import React from "react";

const WorkshopCard = ({ 
  title, 
  description, 
  video = null,
  image = null,
  duration = "",
  className = "" 
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* Media Section */}
      <div className="relative w-full h-48">
        {video ? (
          <video 
            className="w-full h-full object-cover"
            poster={image}
            controls
          >
            <source src={video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : image ? (
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400">No media available</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        {duration && (
          <p className="text-sm text-brand-500 font-medium mb-3">
            Duration: {duration}
          </p>
        )}
        <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          {description}
        </p>
        <button className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          Register Now
        </button>
      </div>
    </div>
  );
};

export default WorkshopCard;