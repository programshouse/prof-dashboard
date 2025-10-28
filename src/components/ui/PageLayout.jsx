import React from "react";
import PageMeta from "../common/PageMeta";

const PageLayout = ({ 
  title, 
  description, 
  children, 
  className = "" 
}) => {
  return (
    <div className={`grid grid-cols-12 gap-4 md:gap-6 p-6 ${className}`}>
      <PageMeta title={title} />
      {children}
    </div>
  );
};

export default PageLayout;
