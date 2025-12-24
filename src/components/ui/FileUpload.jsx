import React, { useState, useEffect } from "react";

const FileUpload = ({
  label,
  name,
  value,
  onChange,
  accept = "image/*",
  required = false,
  className = "",
  disabled = false,
}) => {
  const [preview, setPreview] = useState(null);

  // Handle preview for both File objects and URLs
  useEffect(() => {
    let revokeUrl;
    if (!value) {
      setPreview(null);
    } else if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      revokeUrl = objectUrl;
    } else if (typeof value === "string") {
      setPreview(value);
    }

    return () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-brand-500 transition-colors">
        {preview ? (
          <div className="space-y-4">
            <img 
              src={preview} 
              alt="Preview" 
              className="mx-auto h-32 w-auto object-cover rounded-lg"
            />
            <div className="flex gap-2 justify-center">
              <label className={`bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors ${disabled ? "  cursor-not-allowed hover:bg-brand-500" : ""}`}>
                Change Image
                <input
                  type="file"
                  name={name}
                  accept={accept}
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={disabled}
                />
              </label>
              <button
                type="button"
                onClick={handleRemove}
                className={`bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors ${disabled ? "  cursor-not-allowed hover:bg-red-500" : ""}`}
                disabled={disabled}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div>
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-4">
              <label className={`bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors ${disabled ? "  cursor-not-allowed hover:bg-brand-500" : ""}`}>
                Upload Image
                <input
                  type="file"
                  name={name}
                  accept={accept}
                  onChange={handleFileChange}
                  className="hidden"
                  required={required}
                  disabled={disabled}
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
