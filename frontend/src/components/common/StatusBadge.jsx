import React from 'react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    Pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      dot: 'bg-yellow-400',
    },
    'In Progress': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      dot: 'bg-blue-400',
    },
    Resolved: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      dot: 'bg-green-400',
    },
  };

  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} mr-2`}></span>
      {status}
    </span>
  );
};

export default StatusBadge;