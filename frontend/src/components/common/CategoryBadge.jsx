import React from 'react';

const CategoryBadge = ({ category }) => {
  const categoryConfig = {
    'Roads': { 
      icon: '🛣️', 
      gradient: 'from-orange-400 to-red-500',
      bg: 'bg-orange-50 dark:bg-orange-900/30',
      text: 'text-orange-800 dark:text-orange-200',
      border: 'border-orange-200 dark:border-orange-800'
    },
    'Water Supply': { 
      icon: '💧', 
      gradient: 'from-blue-400 to-cyan-500',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-200',
      border: 'border-blue-200 dark:border-blue-800'
    },
    'Electricity': { 
      icon: '⚡', 
      gradient: 'from-yellow-400 to-amber-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-200',
      border: 'border-yellow-200 dark:border-yellow-800'
    },
    'Garbage': { 
      icon: '🗑️', 
      gradient: 'from-green-400 to-emerald-500',
      bg: 'bg-green-50 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-200 dark:border-green-800'
    },
    'Streetlights': { 
      icon: '💡', 
      gradient: 'from-purple-400 to-pink-500',
      bg: 'bg-purple-50 dark:bg-purple-900/30',
      text: 'text-purple-800 dark:text-purple-200',
      border: 'border-purple-200 dark:border-purple-800'
    },
    'Drainage': { 
      icon: '🌊', 
      gradient: 'from-teal-400 to-cyan-500',
      bg: 'bg-teal-50 dark:bg-teal-900/30',
      text: 'text-teal-800 dark:text-teal-200',
      border: 'border-teal-200 dark:border-teal-800'
    },
    'Parks': { 
      icon: '🌳', 
      gradient: 'from-green-400 to-lime-500',
      bg: 'bg-green-50 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-200 dark:border-green-800'
    },
    'Public Transport': { 
      icon: '🚌', 
      gradient: 'from-indigo-400 to-blue-500',
      bg: 'bg-indigo-50 dark:bg-indigo-900/30',
      text: 'text-indigo-800 dark:text-indigo-200',
      border: 'border-indigo-200 dark:border-indigo-800'
    },
    'Noise Pollution': { 
      icon: '🔊', 
      gradient: 'from-red-400 to-pink-500',
      bg: 'bg-red-50 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-200 dark:border-red-800'
    },
    'Other': { 
      icon: '📋', 
      gradient: 'from-gray-400 to-slate-500',
      bg: 'bg-gray-50 dark:bg-gray-700/30',
      text: 'text-gray-800 dark:text-gray-200',
      border: 'border-gray-200 dark:border-gray-600'
    },
    // Legacy support - map old category names
    'Road': { 
      icon: '🛣️', 
      gradient: 'from-orange-400 to-red-500',
      bg: 'bg-orange-50 dark:bg-orange-900/30',
      text: 'text-orange-800 dark:text-orange-200',
      border: 'border-orange-200 dark:border-orange-800'
    },
    'Water': { 
      icon: '💧', 
      gradient: 'from-blue-400 to-cyan-500',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-200',
      border: 'border-blue-200 dark:border-blue-800'
    },
  };

  const config = categoryConfig[category] || categoryConfig.Other;

  return (
    <div className={`relative inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${config.bg} ${config.text} ${config.border} font-semibold text-xs shadow-md backdrop-blur-sm group hover:scale-105 transition-transform duration-200`}>
      {/* Gradient Overlay on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300`} />
      
      {/* Icon & Text */}
      <span className="relative flex items-center space-x-1.5">
        <span className="text-sm transform group-hover:scale-125 transition-transform duration-200">{config.icon}</span>
        <span className="uppercase tracking-wide">{category}</span>
      </span>
    </div>
  );
};

export default CategoryBadge;