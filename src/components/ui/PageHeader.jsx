import React from "react";

const PageHeader = ({ 
  title, 
  description, 
  className = "" 
}) => {
  return (
    <div className={`col-span-12 ${className}`}>
      <h1 className="text-2xl md:text-3xl font-bold text-brand-600 tracking-tight">
        {title}
      </h1>
      <p className="text-base text-brand-400 mt-1">
        {description}
      </p>
    </div>
  );
};

export default PageHeader;
