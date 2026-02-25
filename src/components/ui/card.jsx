// src/components/ui/WhoAmICard.jsx

import React, { useState, useEffect } from "react";
import { useWhoAmIStore } from "../../stores/useWhoAmIStore";

// Card component for displaying "Who Am I?" information
const WhoAmICard = ({ title, description, features, onMediaUpload }) => {
  const [media, setMedia] = useState(null); // State to store the uploaded media (image/video)
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const fetchAll = useWhoAmIStore((s) => s.fetchAll);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const list = await fetchAll();
        const first = Array.isArray(list) && list.length ? list[0] : null;
        setProfileData(first);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [fetchAll]);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(URL.createObjectURL(file)); // Temporarily display the uploaded media
      onMediaUpload(file); // Optionally handle the media upload logic
    }
  };

  if (loading) {
    return (
      <div className="max-w-sm rounded-lg shadow-lg bg-white p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Use fetched data if available, otherwise fallback to props
  const displayTitle = profileData?.title || title;
  const displayDescription = profileData?.description || description;
  const displayFeatures = profileData?.features || features;
  const displayVideoLink = profileData?.video_link;

  return (
    <div className="max-w-sm rounded-lg shadow-lg bg-white p-6">
      {/* Title */}
      <h2 className="text-2xl font-semibold mb-3">{displayTitle}</h2>
      
      {/* Description */}
      <p className="text-gray-700 mb-4">{displayDescription}</p>
      
      {/* Features List */}
      <ul className="list-disc pl-5 mb-4">
        {(displayFeatures || []).map((feature, index) => (
          <li key={index} className="text-gray-600">{feature}</li>
        ))}
      </ul>

      {/* Video Link */}
      {displayVideoLink && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Video Link:
          </h3>
          <a 
            href={displayVideoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">Watch Video</span>
          </a>
        </div>
      )}

      {/* Media Upload Section */}
      <div className="mb-4">
        <label
          htmlFor="media-upload"
          className="cursor-pointer text-blue-500 hover:underline"
        >
          {media ? "Change Media" : "Upload Profile Image or Video"}
        </label>
        <input
          type="file"
          id="media-upload"
          className="hidden"
          accept="image/*,video/*"
          onChange={handleMediaChange}
        />
        {media && (
          <div className="mt-3">
            {media.includes("image") ? (
              <img src={media} alt="Profile" className="w-32 h-32 object-cover rounded-full" />
            ) : (
              <video className="w-32 h-32 object-cover rounded-full" controls>
                <source src={media} type="video/mp4" />
              </video>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhoAmICard;

