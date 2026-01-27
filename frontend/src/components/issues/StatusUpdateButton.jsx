import React, { useState } from 'react';

const StatusUpdateButton = ({ currentStatus, onUpdate, disabled }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const statusFlow = {
    Pending: 'In Progress',
    'In Progress': 'Resolved',
    Resolved: null, // Can't update further
  };

  const nextStatus = statusFlow[currentStatus];

  const handleUpdate = async () => {
    if (!nextStatus) return;
    
    setIsUpdating(true);
    await onUpdate(nextStatus);
    setIsUpdating(false);
  };

  if (!nextStatus) {
    return (
      <div className="text-sm text-gray-500 italic">Issue resolved</div>
    );
  }

  return (
    <button
      onClick={handleUpdate}
      disabled={disabled || isUpdating}
      className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isUpdating ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Updating...
        </span>
      ) : (
        `Mark as ${nextStatus}`
      )}
    </button>
  );
};

export default StatusUpdateButton;