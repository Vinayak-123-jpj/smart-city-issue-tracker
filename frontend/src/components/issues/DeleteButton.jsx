import React, { useState } from 'react';

const DeleteButton = ({ onDelete, disabled }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
    setShowConfirm(false);
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        disabled={disabled}
        className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Delete Issue
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Are you sure?</span>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
      >
        {isDeleting ? 'Deleting...' : 'Yes, Delete'}
      </button>
      <button
        onClick={() => setShowConfirm(false)}
        disabled={isDeleting}
        className="text-gray-600 hover:text-gray-700 text-sm font-medium"
      >
        Cancel
      </button>
    </div>
  );
};

export default DeleteButton;