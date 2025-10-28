import React from "react";

const WhoAmICard = ({ 
  title, 
  description, 
  features = [], 
  image = null,
  video = null,
  className = "" 
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Media Section */}
        <div className="lg:w-1/2">
          {video ? (
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <video 
                className="w-full h-full object-cover"
                controls
                poster={image}
              >
                <source src={video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : image ? (
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <img 
                src={image} 
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-64 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400">No media available</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="lg:w-1/2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {description}
          </p>
          
          {features.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Key Features:
              </h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhoAmICard;
