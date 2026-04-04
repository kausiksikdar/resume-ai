import React from 'react';

export const SkeletonSearchResult = () => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse bg-white dark:bg-gray-800">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
      <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
    </div>
    <div className="flex gap-2 mt-3">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
    </div>
  </div>
);
// Optional: other skeletons
export const SkeletonText = ({ width = '100%', height = '1rem', className = '' }) => (
  <div className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`} style={{ width, height }} />
);

export const SkeletonCard = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}>
    {children || (
      <>
        <SkeletonText width="60%" height="1.5rem" className="mb-2" />
        <SkeletonText width="80%" height="1rem" className="mb-1" />
        <SkeletonText width="40%" height="1rem" />
      </>
    )}
  </div>
);

export const SkeletonResumeItem = () => (
  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="flex gap-3 mt-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  </div>
);

export const SkeletonDocumentCard = () => (
  <div className="border rounded-lg p-4 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="h-5 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-24 mt-2"></div>
      </div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

export const SkeletonJobItem = () => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 animate-pulse bg-white dark:bg-gray-800">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-1"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </div>
      <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

export const SkeletonApplicationCard = () => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse bg-white dark:bg-gray-800">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="flex gap-2 mt-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mt-2"></div>
      </div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  </div>
);