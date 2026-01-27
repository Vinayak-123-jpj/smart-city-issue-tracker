import React from 'react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger' // 'danger', 'warning', 'info'
}) => {
  if (!isOpen) return null;

  const getIconColor = () => {
    switch (type) {
      case 'danger': return 'bg-red-100 text-red-600';
      case 'warning': return 'bg-yellow-100 text-yellow-600';
      case 'info': return 'bg-blue-100 text-blue-600';
      default: return 'bg-red-100 text-red-600';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 hover:bg-red-700';
      case 'warning': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'info': return 'bg-blue-600 hover:bg-blue-700';
      default: return 'bg-red-600 hover:bg-red-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full ${getIconColor()}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
          {title}
        </h3>

        <p className="text-center text-gray-600 mb-6">
          {message}
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors btn-press"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors btn-press ${getButtonColor()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;