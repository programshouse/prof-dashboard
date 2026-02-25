import React from "react";

const WhoAmICard = ({
  title,
  description,
  features = [],
  image = null,
  video = null,
  video_link = null,
  className = "",
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Media Section */}
        <div className="lg:w-1/2">
          {video ? (
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <video
                className="w-full h-full object-cover"
                controls
                poster={image || undefined}
              >
                <source src={video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : image ? (
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <img
                src={image}
                alt={title || "Who Am I"}
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
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {title}
            </h2>
          )}

          {description && (
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {description}
            </p>
          )}

          {/* Features */}
          {Array.isArray(features) && features.length > 0 && (
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

          {/* Video Link */}
          {video_link && video_link.trim() !== "" && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Video Link:
              </h3>
              <a
                href={video_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">Watch Video</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhoAmICard;