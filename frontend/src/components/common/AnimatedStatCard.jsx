import React, { useEffect, useState } from 'react';

const AnimatedStatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue', 
  trend, 
  trendValue,
  delay = 0,
  prefix = '',
  suffix = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  const colorConfig = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-400 bg-opacity-30'
    },
    green: {
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-400 bg-opacity-30'
    },
    yellow: {
      gradient: 'from-yellow-500 to-yellow-600',
      bg: 'bg-yellow-100 dark:bg-yellow-900',
      text: 'text-yellow-600 dark:text-yellow-400',
      iconBg: 'bg-yellow-400 bg-opacity-30'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900',
      text: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-400 bg-opacity-30'
    },
    red: {
      gradient: 'from-red-500 to-red-600',
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-400 bg-opacity-30'
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-100 dark:bg-orange-900',
      text: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-400 bg-opacity-30'
    }
  };

  const config = colorConfig[color] || colorConfig.blue;

  // Animate number counting
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let currentStep = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        currentStep++;
        setDisplayValue(Math.min(Math.floor(increment * currentStep), value));
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setDisplayValue(value);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover-lift card-enter group cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className={`text-3xl font-bold ${config.text} transition-all duration-300`}>
              {prefix}{displayValue.toLocaleString()}{suffix}
            </h3>
            {trend && (
              <span className={`text-sm font-medium flex items-center ${
                trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {trend === 'up' ? (
                  <svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {trendValue}%
              </span>
            )}
          </div>
        </div>
        
        <div className={`${config.bg} p-4 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
          <div className={`${config.iconBg} p-1 rounded-lg`}>
            {icon}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min((displayValue / value) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default AnimatedStatCard;