import React from 'react';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import AIPriorityBadge from '../common/AIPriorityBadge';

const EnhancedIssueCard = ({ issue, onClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusGradient = (status) => {
    const gradients = {
      'Pending': 'from-yellow-400/20 to-orange-400/20',
      'In Progress': 'from-blue-400/20 to-indigo-400/20',
      'Resolved': 'from-green-400/20 to-emerald-400/20'
    };
    return gradients[status] || gradients['Pending'];
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transform hover:-translate-y-2"
    >
      {/* Gradient Overlay on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getStatusGradient(issue.status)} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Image Section */}
      {issue.imageUrl && (
        <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
          <img
            src={`http://localhost:5000${issue.imageUrl}`}
            alt={issue.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
          {/* Image Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Floating Status Badge on Image */}
          <div className="absolute top-4 right-4">
            <StatusBadge status={issue.status} />
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="relative p-6 space-y-4">
        {/* Header with badges */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CategoryBadge category={issue.category} />
          <div className="flex items-center gap-2">
            <AIPriorityBadge issue={issue} />
            {!issue.imageUrl && <StatusBadge status={issue.status} />}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {issue.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
          {issue.description}
        </p>

        {/* Location */}
        {issue.location && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-700/50 rounded-xl px-3 py-2">
            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1 font-medium">{issue.location}</span>
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-6">
            {/* Upvotes */}
            <div className="flex items-center space-x-2 group/upvote">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-0 group-hover/upvote:opacity-50 transition-opacity"></div>
                <svg className="relative w-6 h-6 text-blue-600 dark:text-blue-400 transform group-hover/upvote:scale-125 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4l-8 8h5v8h6v-8h5z" />
                </svg>
              </div>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{issue.upvoteCount || 0}</span>
            </div>

            {/* Comments */}
            <div className="flex items-center space-x-2 group/comment">
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover/comment:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-gray-600 dark:text-gray-400 font-semibold">{issue.commentCount || 0}</span>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 font-medium">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(issue.createdAt)}
          </div>
        </div>

        {/* Reporter info */}
        {issue.reportedBy && (
          <div className="flex items-center text-xs pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mr-3 shadow-lg transform group-hover:scale-110 transition-transform">
              <span className="text-sm font-bold text-white">
                {issue.reportedBy.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Reported by </span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{issue.reportedBy.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Hover Arrow Indicator */}
      <div className="absolute top-1/2 right-6 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:right-4 transition-all duration-300">
        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
    </div>
  );
};

export default EnhancedIssueCard;