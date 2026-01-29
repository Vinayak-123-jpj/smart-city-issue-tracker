import React, { useState, useEffect } from 'react';
import { analyzeIssuePriority } from '../../services/aiService';

const AIPriorityBadge = ({ issue }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const analyzePriority = async () => {
    setLoading(true);
    try {
      const result = await analyzeIssuePriority(
        issue.title,
        issue.description,
        issue.upvoteCount || 0,
        issue.category
      );
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze priority:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-300 dark:border-orange-700',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700'
    };
    return colors[priority] || colors.medium;
  };

  const getSentimentIcon = (sentiment) => {
    const icons = {
      frustrated: '😠',
      concerned: '😟',
      neutral: '😐',
      informative: '📋'
    };
    return icons[sentiment] || '📋';
  };

  if (!analysis && !loading) {
    return (
      <button
        onClick={analyzePriority}
        className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors border border-purple-200 dark:border-purple-800"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span>AI Priority</span>
      </button>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Analyzing...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-3 py-1 text-xs font-bold rounded-lg transition-colors border ${getPriorityColor(analysis.priority)}`}
      >
        <span>{getSentimentIcon(analysis.sentiment)}</span>
        <span className="uppercase">{analysis.priority}</span>
        <span className="text-xs opacity-75">({analysis.urgencyScore}/10)</span>
      </button>

      {showDetails && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50 animate-scale-in">
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">AI Analysis</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Urgency:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{analysis.urgencyScore}/10</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Sentiment:</span>
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">{analysis.sentiment}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Impact:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{analysis.estimatedImpact}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Suggested Action:</h5>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {analysis.suggestedAction}
              </p>
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="w-full px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPriorityBadge;