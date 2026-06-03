import React from 'react';

const SectionHeader = ({ title, description, actionElement }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-4">
      <div>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight dark:text-white text-slate-900 tracking-tight leading-tight">{title}</h2>
        {description && (
          <p className="text-xs sm:text-sm font-bold dark:text-slate-400 text-slate-500 mt-1 sm:mt-2">{description}</p>
        )}
      </div>
      {actionElement && (
        <div className="flex-shrink-0">
          {actionElement}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
