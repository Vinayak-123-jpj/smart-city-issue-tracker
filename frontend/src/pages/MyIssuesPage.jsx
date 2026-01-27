import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import Navbar from '../components/layout/Navbar';
import IssueCard from '../components/issues/IssueCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import StatusBadge from '../components/common/StatusBadge';
import CategoryBadge from '../components/common/CategoryBadge';
import toast from 'react-hot-toast';


const MyIssuesPage = () => {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchMyIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await issueAPI.getMyIssues();
      setIssues(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) {
      return;
    }

    try {
      await issueAPI.delete(issueId);
      fetchMyIssues();
      setSelectedIssue(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete issue');
    }
  };

  const getFilteredIssues = () => {
    if (filterStatus === 'All') return issues;
    return issues.filter(issue => issue.status === filterStatus);
  };

  const filteredIssues = getFilteredIssues();

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'Pending').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    resolved: issues.filter(i => i.status === 'Resolved').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Reported Issues</h2>
          <p className="mt-1 text-gray-600">Track the status of issues you've reported</p>
        </div>

        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Issues</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-yellow-200">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Resolved</p>
              <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
            </div>
          </div>
        )}

        {!loading && !error && issues.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {['All', 'Pending', 'In Progress', 'Resolved'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && <LoadingSpinner message="Loading your issues..." />}
        {error && <ErrorMessage message={error} onRetry={fetchMyIssues} />}

        {!loading && !error && issues.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No issues reported yet</h3>
            <p className="mt-2 text-gray-500">Start by reporting your first issue</p>
          </div>
        )}

        {!loading && !error && filteredIssues.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map(issue => (
              <IssueCard
                key={issue._id}
                issue={issue}
                onClick={() => setSelectedIssue(issue)}
              />
            ))}
          </div>
        )}

        {!loading && !error && issues.length > 0 && filteredIssues.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No issues found with status: {filterStatus}</p>
          </div>
        )}
      </main>

      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedIssue(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedIssue.title}</h2>
                  <div className="flex items-center space-x-3">
                    <CategoryBadge category={selectedIssue.category} />
                    <StatusBadge status={selectedIssue.status} />
                  </div>
                </div>
                <button onClick={() => setSelectedIssue(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-6 space-y-6">
              {selectedIssue.imageUrl && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Issue Image</h3>
                  <img src={`http://localhost:5000${selectedIssue.imageUrl}`} alt={selectedIssue.title} className="w-full rounded-lg" />
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-900">{selectedIssue.description}</p>
              </div>

              {selectedIssue.location && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
                  <p className="text-gray-900">{selectedIssue.location}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 text-primary-600 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4l-8 8h5v8h6v-8h5z" />
                    </svg>
                    {selectedIssue.upvoteCount || 0} upvotes
                  </span>
                  <span className="text-sm text-gray-500">
                    Reported {new Date(selectedIssue.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {selectedIssue.status === 'Pending' && (
                  <button
                    onClick={() => handleDeleteIssue(selectedIssue._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete Issue
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyIssuesPage;