import React from 'react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    Pending: {
      gradient: 'from-yellow-400 to-orange-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-200',
      border: 'border-yellow-200 dark:border-yellow-800',
      dot: 'bg-yellow-500',
      icon: '⏳',
      pulse: true
    },
    'In Progress': {
      gradient: 'from-blue-400 to-indigo-500',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-200',
      border: 'border-blue-200 dark:border-blue-800',
      dot: 'bg-blue-500',
      icon: '🔧',
      pulse: true
    },
    Resolved: {
      gradient: 'from-green-400 to-emerald-500',
      bg: 'bg-green-50 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-200 dark:border-green-800',
      dot: 'bg-green-500',
      icon: '✅',
      pulse: false
    },
  };

  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <div className={`relative inline-flex items-center space-x-2 px-4 py-2 rounded-xl border-2 ${config.bg} ${config.text} ${config.border} font-bold text-sm shadow-lg backdrop-blur-sm group hover:scale-105 transition-transform duration-200`}>
      {/* Gradient Overlay on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300`} />
      
      {/* Animated Dot */}
      <span className="relative flex h-3 w-3">
        {config.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${config.dot}`}></span>
      </span>
      
      {/* Icon & Text */}
      <span className="relative flex items-center space-x-1.5">
        <span className="text-base">{config.icon}</span>
        <span>{status}</span>
      </span>
    </div>
  );
};

export default StatusBadge;