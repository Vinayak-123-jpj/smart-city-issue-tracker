import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import Navbar from '../components/layout/Navbar';
import IssueCard from '../components/issues/IssueCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import StatusBadge from '../components/common/StatusBadge';
import CategoryBadge from '../components/common/CategoryBadge';
import ImageZoom from '../components/common/ImageZoom';
import ConfirmModal from '../components/common/ConfirmModal';
import toast from 'react-hot-toast';

const MyIssuesPage = () => {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);

  const fetchMyIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await issueAPI.getMyIssues();
      setIssues(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your issues');
      toast.error('Failed to load your issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const handleDeleteIssue = async () => {
    if (!issueToDelete) return;

    try {
      await issueAPI.delete(issueToDelete);
      toast.success('Issue deleted successfully! 🗑️', {
        icon: '✅',
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
        },
      });
      fetchMyIssues();
      setSelectedIssue(null);
      setShowDeleteModal(false);
      setIssueToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete issue');
    }
  };

  const getFilteredAndSortedIssues = () => {
    let filtered = [...issues];
    
    // Filter by status
    if (filterStatus !== 'All') {
      filtered = filtered.filter(issue => issue.status === filterStatus);
    }
    
    // Sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'upvotes':
        filtered.sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0));
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const filteredIssues = getFilteredAndSortedIssues();

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'Pending').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    resolved: issues.filter(i => i.status === 'Resolved').length,
    totalUpvotes: issues.reduce((sum, i) => sum + (i.upvoteCount || 0), 0),
  };

  const statusFilters = ['All', 'Pending', 'In Progress', 'Resolved'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Navbar user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-down">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Home</span>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-primary-600 dark:text-primary-400 font-medium">My Issues</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-600">
                My Reported Issues
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Track and manage your civic contributions</p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="mt-4 sm:mt-0 flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover-lift animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Total Issues</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-yellow-100 dark:border-yellow-900/50 hover-lift animate-fade-in" style={{ animationDelay: '0.05s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Pending</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-900/50 hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">In Progress</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{stats.inProgress}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🔧</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-green-100 dark:border-green-900/50 hover-lift animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Resolved</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">{stats.resolved}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-purple-100 dark:border-purple-900/50 hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Total Upvotes</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">{stats.totalUpvotes}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👍</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        {!loading && !error && issues.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Filter by Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {statusFilters.map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                        filterStatus === status
                          ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-lg shadow-primary-500/50'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {status}
                      {status !== 'All' && (
                        <span className="ml-2 text-xs opacity-75">
                          ({status === 'Pending' ? stats.pending : status === 'In Progress' ? stats.inProgress : stats.resolved})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white font-medium"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="upvotes">Most Upvoted</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-bold text-primary-600 dark:text-primary-400">{filteredIssues.length}</span> of{' '}
                <span className="font-bold text-gray-900 dark:text-white">{stats.total}</span> issue{stats.total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSpinner message="Loading your issues..." />}

        {/* Error State */}
        {error && <ErrorMessage message={error} onRetry={fetchMyIssues} />}

        {/* Empty State - No Issues */}
        {!loading && !error && issues.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg animate-fade-in">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center animate-bounce-once">
              <span className="text-6xl">📝</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Issues Reported Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Start making a difference! Report your first civic issue and help improve our community.
            </p>
            <button
              onClick={() => window.location.href = '/citizen/dashboard'}
              className="px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover-lift"
            >
              Report Your First Issue
            </button>
          </div>
        )}

        {/* Empty State - No Results */}
        {!loading && !error && issues.length > 0 && filteredIssues.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Issues Found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              No issues match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        )}

        {/* Issues Display */}
        {!loading && !error && filteredIssues.length > 0 && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredIssues.map((issue, index) => (
              <div
                key={issue._id}
                className={`card-enter ${viewMode === 'list' ? 'transform-none' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {viewMode === 'grid' ? (
                  <IssueCard
                    issue={issue}
                    onClick={() => setSelectedIssue(issue)}
                  />
                ) : (
                  // List View
                  <div
                    onClick={() => setSelectedIssue(issue)}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer hover-lift"
                  >
                    <div className="flex items-start space-x-4">
                      {issue.imageUrl && (
                        <img
                          src={`http://localhost:5000${issue.imageUrl}`}
                          alt={issue.title}
                          className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{issue.title}</h3>
                          <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                            <StatusBadge status={issue.status} />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {issue.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <CategoryBadge category={issue.category} />
                            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <svg className="w-4 h-4 mr-1 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 4l-8 8h5v8h6v-8h5z" />
                              </svg>
                              {issue.upvoteCount || 0}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setSelectedIssue(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-blue-600 px-8 py-6 rounded-t-3xl">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold text-white mb-3">{selectedIssue.title}</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <CategoryBadge category={selectedIssue.category} />
                    <StatusBadge status={selectedIssue.status} />
                    <span className="flex items-center text-sm text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4l-8 8h5v8h6v-8h5z" />
                      </svg>
                      {selectedIssue.upvoteCount || 0} upvotes
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-8 space-y-6">
              {/* Image */}
              {selectedIssue.imageUrl && (
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <ImageZoom
                    src={`http://localhost:5000${selectedIssue.imageUrl}`}
                    alt={selectedIssue.title}
                    className="w-full"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <span className="w-1 h-4 bg-primary-600 rounded-full mr-2"></span>
                  Description
                </h3>
                <p className="text-gray-900 dark:text-white leading-relaxed bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  {selectedIssue.description}
                </p>
              </div>

              {/* Location */}
              {selectedIssue.location && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <span className="w-1 h-4 bg-primary-600 rounded-full mr-2"></span>
                    Location
                  </h3>
                  <div className="flex items-center text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <svg className="w-5 h-5 mr-3 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{selectedIssue.location}</span>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      Reported on {new Date(selectedIssue.createdAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>

                  {selectedIssue.status === 'Pending' && (
                    <button
                      onClick={() => {
                        setIssueToDelete(selectedIssue._id);
                        setShowDeleteModal(true);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all font-semibold"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete Issue</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setIssueToDelete(null);
        }}
        onConfirm={handleDeleteIssue}
        title="Delete This Issue?"
        message="This action cannot be undone. The issue will be permanently removed from the system."
        confirmText="Delete Issue"
        cancelText="Keep Issue"
        type="danger"
      />
    </div>
  );
};

export default MyIssuesPage;