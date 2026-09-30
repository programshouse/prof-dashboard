import React from "react";

export default function UniversalCard({ widthClass = "w-full", className = "", children }) {
  return (
    <div className={`${widthClass}`}>
      <div className={`h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${className}`}>
        {children}
      </div>
    </div>
  );
}
