import React from 'react';

const IssueTimeline = ({ issue }) => {
  const getTimelineEvents = () => {
    const events = [
      {
        id: 1,
        type: 'created',
        title: 'Issue Reported',
        description: `Reported by ${issue.reportedBy?.name || 'Anonymous'}`,
        timestamp: issue.createdAt,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        ),
        color: 'blue',
        completed: true,
      },
    ];

    if (issue.status === 'In Progress' || issue.status === 'Resolved') {
      events.push({
        id: 2,
        type: 'in-progress',
        title: 'Work Started',
        description: 'Authority began addressing the issue',
        timestamp: issue.updatedAt,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        color: 'purple',
        completed: true,
      });
    }

    if (issue.status === 'Resolved') {
      events.push({
        id: 3,
        type: 'resolved',
        title: 'Issue Resolved',
        description: 'Successfully completed and verified',
        timestamp: issue.updatedAt,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        color: 'green',
        completed: true,
      });
    }

    return events;
  };

  const events = getTimelineEvents();

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-500',
        lightBg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-500',
        ring: 'ring-blue-100 dark:ring-blue-900/30',
      },
      purple: {
        bg: 'bg-purple-500',
        lightBg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-500',
        ring: 'ring-purple-100 dark:ring-purple-900/30',
      },
      green: {
        bg: 'bg-green-500',
        lightBg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-500',
        ring: 'ring-green-100 dark:ring-green-900/30',
      },
    };
    return colors[color];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Issue Timeline
      </h3>

      <div className="space-y-8">
        {events.map((event, index) => {
          const colors = getColorClasses(event.color);
          const isLast = index === events.length - 1;

          return (
            <div key={event.id} className="relative">
              {/* Timeline Line */}
              {!isLast && (
                <div
                  className={`absolute left-6 top-12 w-0.5 h-full ${
                    event.completed ? colors.bg : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  style={{ transform: 'translateX(-50%)' }}
                ></div>
              )}

              {/* Event Container */}
              <div className="flex items-start space-x-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                {/* Icon Circle */}
                <div
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full ${
                    event.completed ? colors.bg : 'bg-gray-200 dark:bg-gray-700'
                  } text-white shadow-lg ${event.completed ? `ring-4 ${colors.ring}` : ''} z-10 transition-all duration-300 hover:scale-110`}
                >
                  {event.icon}
                  
                  {/* Pulse Animation for Active Step */}
                  {event.completed && isLast && (
                    <>
                      <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping"></span>
                      <span className={`absolute inline-flex h-full w-full rounded-full ${colors.bg}`}></span>
                    </>
                  )}
                </div>

                {/* Event Content */}
                <div className={`flex-1 ${colors.lightBg} rounded-lg p-4 border-l-4 ${colors.border} shadow-sm hover:shadow-md transition-shadow duration-200`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-base font-semibold ${colors.text} mb-1`}>
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {event.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(event.timestamp)}
                      </div>
                    </div>

                    {/* Status Badge */}
                    {event.completed && (
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} text-white`}>
                        Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Summary */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Progress
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {Math.round((events.filter(e => e.completed).length / 3) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${(events.filter(e => e.completed).length / 3) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default IssueTimeline;