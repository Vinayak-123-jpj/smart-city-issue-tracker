import React from 'react';

const CategoryBadge = ({ category }) => {
  const categoryConfig = {
    Road: { icon: '🛣️', color: 'bg-orange-100 text-orange-800' },
    Water: { icon: '💧', color: 'bg-blue-100 text-blue-800' },
    Electricity: { icon: '⚡', color: 'bg-yellow-100 text-yellow-800' },
    Garbage: { icon: '🗑️', color: 'bg-green-100 text-green-800' },
    Other: { icon: '📋', color: 'bg-gray-100 text-gray-800' },
  };

  const config = categoryConfig[category] || categoryConfig.Other;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {category}
    </span>
  );
};

export default CategoryBadge;