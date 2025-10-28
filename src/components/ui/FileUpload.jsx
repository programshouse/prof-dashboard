import React, { useState } from "react";

const FileUpload = ({ 
  label, 
  name, 
  value, 
  onChange, 
  accept = "image/*",
  required = false,
  className = "" 
}) => {
  const [preview, setPreview] = useState(value ? URL.createObjectURL(value) : null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onChange({ target: { name, value: file } });
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange({ target: { name, value: null } });
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
              <label className="bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors">
                Change Image
                <input
                  type="file"
                  accept={accept}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
              <label className="bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors">
                Upload Image
                <input
                  type="file"
                  accept={accept}
                  onChange={handleFileChange}
                  className="hidden"
                  required={required}
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
