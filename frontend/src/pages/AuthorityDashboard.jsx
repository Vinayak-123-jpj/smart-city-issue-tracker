import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AIPriorityBadge from '../components/common/AIPriorityBadge';

import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AuthorityDashboard = () => {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await issueAPI.getAll({ sort: 'upvotes' });
      setIssues(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleUpdateStatus = async (issueId, newStatus) => {
    try {
      await issueAPI.update(issueId, { status: newStatus });
      toast.success('Issue status updated!');
      fetchIssues();
      setSelectedIssue(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} onLogout={logout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Authority Dashboard</h2>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid gap-4">
            {issues.map((issue) => (
              <div 
                key={issue._id} 
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700" 
                onClick={() => setSelectedIssue(issue)}
              >
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{issue.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{issue.description.substring(0, 100)}...</p>
                <div className="flex items-center gap-4 mt-4 flex-wrap">
  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">👍 {issue.upvoteCount || 0}</span>
  <AIPriorityBadge issue={issue} />
  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                
                    issue.status === 'Pending' 
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' 
                      : issue.status === 'In Progress' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  }`}>
                    {issue.status}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{issue.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedIssue && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50" 
            onClick={() => setSelectedIssue(null)}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{selectedIssue.title}</h2>
              <p className="mb-6 text-gray-700 dark:text-gray-300">{selectedIssue.description}</p>
              <div className="flex items-center gap-4 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedIssue.status === 'Pending' 
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' 
                    : selectedIssue.status === 'In Progress' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                    : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                }`}>
                  {selectedIssue.status}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">👍 {selectedIssue.upvoteCount || 0}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleUpdateStatus(selectedIssue._id, 'In Progress')} 
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  Mark In Progress
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedIssue._id, 'Resolved')} 
                  className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AuthorityDashboard;