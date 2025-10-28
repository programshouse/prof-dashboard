// src/components/ui/WhoAmICard.jsx

import React, { useState } from "react";

// Card component for displaying "Who Am I?" information
const WhoAmICard = ({ title, description, features, onMediaUpload }) => {
  const [media, setMedia] = useState(null); // State to store the uploaded media (image/video)

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(URL.createObjectURL(file)); // Temporarily display the uploaded media
      onMediaUpload(file); // Optionally handle the media upload logic
    }
  };

  return (
    <div className="max-w-sm rounded-lg shadow-lg bg-white p-6">
      {/* Title */}
      <h2 className="text-2xl font-semibold mb-3">{title}</h2>
      
      {/* Description */}
      <p className="text-gray-700 mb-4">{description}</p>
      
      {/* Features List */}
      <ul className="list-disc pl-5 mb-4">
        {(features || []).map((feature, index) => (
          <li key={index} className="text-gray-600">{feature}</li>
        ))}
      </ul>

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

