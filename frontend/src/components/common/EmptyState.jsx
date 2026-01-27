import React from 'react';

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  iconColor = 'text-gray-400'
}) => {
  return (
    <div className="text-center py-16 px-4 animate-fade-in">
      <div className={`mx-auto h-24 w-24 ${iconColor} mb-6 animate-bounce-once`}>
        {icon || (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2 animate-slide-up">
        {title}
      </h3>
      
      <p className="text-gray-500 mb-6 max-w-md mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {description}
      </p>
      
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="btn-primary animate-slide-up hover-lift"
          style={{ animationDelay: '0.2s' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;