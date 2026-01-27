import React from 'react';

const Skeleton = ({ className, variant = 'rectangular' }) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

export const IssueCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>
      
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex space-x-3">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
};

export const StatCardSkeleton = () => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton variant="circular" className="w-12 h-12" />
      </div>
    </div>
  );
};

export default Skeleton;