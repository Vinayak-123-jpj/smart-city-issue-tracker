import React from 'react';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';

const IssueCard = ({ issue, onClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 overflow-hidden"
    >
      {/* Image if exists */}
      {issue.imageUrl && (
        <div className="w-full h-48 bg-gray-200 overflow-hidden">
          <img
            src={`http://localhost:5000${issue.imageUrl}`}
            alt={issue.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-5">
        {/* Header with badges */}
        <div className="flex items-center justify-between mb-3">
          <CategoryBadge category={issue.category} />
          <StatusBadge status={issue.status} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {issue.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {issue.description}
        </p>

        {/* Location if exists */}
        {issue.location && (
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{issue.location}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {/* Upvotes */}
            <div className="flex items-center space-x-1">
              <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4l-8 8h5v8h6v-8h5z" />
              </svg>
              <span className="font-semibold text-primary-600">{issue.upvoteCount || 0}</span>
            </div>

            {/* Comments count */}
            <div className="flex items-center space-x-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{issue.commentCount || 0}</span>
            </div>
          </div>

          {/* Date */}
          <span className="text-xs text-gray-400">
            {formatDate(issue.createdAt)}
          </span>
        </div>

        {/* Reporter info */}
        {issue.reportedBy && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-500">
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mr-2">
              <span className="text-xs font-semibold text-gray-700">
                {issue.reportedBy.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span>Reported by {issue.reportedBy.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;