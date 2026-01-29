import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import { analyzeIssuePriority } from '../services/aiService';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import CategoryBadge from '../components/common/CategoryBadge';
import AIPriorityBadge from '../components/common/AIPriorityBadge';
import AnimatedStatCard from '../components/common/AnimatedStatCard';
import ImageZoom from '../components/common/ImageZoom';
import MapView from '../components/common/MapView';
import IssueTimeline from '../components/issues/IssueTimeline';
import CommentsSection from '../components/issues/CommentsSection';

const EnhancedAuthorityDashboard = () => {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards', 'table', 'kanban'
  const [selectedIssues, setSelectedIssues] = useState(new Set());
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [analyzingIssues, setAnalyzingIssues] = useState(new Set());

  // Advanced Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
    category: 'All',
    priority: 'All',
    sortBy: 'priority', // 'priority', 'upvotes', 'recent', 'oldest'
    dateRange: 'all', // 'today', 'week', 'month', 'all'
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
    highPriority: 0,
    avgResolutionTime: 0,
    citizenSatisfaction: 0,
  });

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await issueAPI.getAll({ sort: filters.sortBy });
      setIssues(response.data);
      calculateStats(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (issuesData) => {
    const total = issuesData.length;
    const pending = issuesData.filter(i => i.status === 'Pending').length;
    const inProgress = issuesData.filter(i => i.status === 'In Progress').length;
    const resolved = issuesData.filter(i => i.status === 'Resolved').length;
    
    // Mock additional stats (would come from real AI analysis)
    const critical = Math.floor(total * 0.15);
    const highPriority = Math.floor(total * 0.35);
    const avgResolutionTime = 4.2; // days
    const citizenSatisfaction = 87; // percentage

    setStats({
      total,
      pending,
      inProgress,
      resolved,
      critical,
      highPriority,
      avgResolutionTime,
      citizenSatisfaction,
    });
  };

  const handleUpdateStatus = async (issueId, newStatus) => {
    try {
      await issueAPI.update(issueId, { status: newStatus });
      toast.success(`Issue marked as ${newStatus}! ✅`, {
        icon: newStatus === 'Resolved' ? '🎉' : '🔄',
      });
      fetchIssues();
      if (selectedIssue?._id === issueId) {
        setSelectedIssue(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleBatchUpdateStatus = async (newStatus) => {
    const selectedIds = Array.from(selectedIssues);
    if (selectedIds.length === 0) {
      toast.error('No issues selected');
      return;
    }

    const loadingToast = toast.loading(`Updating ${selectedIds.length} issues...`);
    
    try {
      await Promise.all(
        selectedIds.map(id => issueAPI.update(id, { status: newStatus }))
      );
      
      toast.success(`${selectedIds.length} issues updated to ${newStatus}!`, { id: loadingToast });
      setSelectedIssues(new Set());
      setShowBatchActions(false);
      fetchIssues();
    } catch (err) {
      toast.error('Failed to update some issues', { id: loadingToast });
    }
  };

  const toggleIssueSelection = (issueId) => {
    setSelectedIssues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(issueId)) {
        newSet.delete(issueId);
      } else {
        newSet.add(issueId);
      }
      return newSet;
    });
  };

  const selectAllIssues = () => {
    if (selectedIssues.size === filteredIssues.length) {
      setSelectedIssues(new Set());
    } else {
      setSelectedIssues(new Set(filteredIssues.map(i => i._id)));
    }
  };

  const analyzeIssueWithAI = async (issue) => {
    if (aiAnalysis[issue._id]) return; // Already analyzed

    setAnalyzingIssues(prev => new Set([...prev, issue._id]));
    
    try {
      const analysis = await analyzeIssuePriority(
        issue.title,
        issue.description,
        issue.upvoteCount || 0,
        issue.category
      );
      
      setAiAnalysis(prev => ({
        ...prev,
        [issue._id]: analysis
      }));
      
      toast.success('AI analysis complete! 🤖', { duration: 2000 });
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAnalyzingIssues(prev => {
        const newSet = new Set(prev);
        newSet.delete(issue._id);
        return newSet;
      });
    }
  };

  const getFilteredIssues = () => {
    let filtered = [...issues];

    // Search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        issue =>
          issue.title.toLowerCase().includes(searchLower) ||
          issue.description.toLowerCase().includes(searchLower) ||
          issue.location?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'All') {
      filtered = filtered.filter(issue => issue.status === filters.status);
    }

    // Category filter
    if (filters.category !== 'All') {
      filtered = filtered.filter(issue => issue.category === filters.category);
    }

    // Priority filter (using AI analysis)
    if (filters.priority !== 'All') {
      filtered = filtered.filter(issue => {
        const analysis = aiAnalysis[issue._id];
        return analysis?.priority === filters.priority.toLowerCase();
      });
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const ranges = {
        today: 1,
        week: 7,
        month: 30,
      };
      const daysBack = ranges[filters.dateRange];
      if (daysBack) {
        const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(issue => new Date(issue.createdAt) >= cutoffDate);
      }
    }

    // Sorting
    switch (filters.sortBy) {
      case 'priority':
        filtered.sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const aPriority = aiAnalysis[a._id]?.priority || 'medium';
          const bPriority = aiAnalysis[b._id]?.priority || 'medium';
          return (priorityOrder[bPriority] || 2) - (priorityOrder[aPriority] || 2);
        });
        break;
      case 'upvotes':
        filtered.sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredIssues = getFilteredIssues();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const categories = ['All', 'Roads', 'Water Supply', 'Electricity', 'Garbage', 'Streetlights', 'Drainage', 'Parks', 'Public Transport', 'Noise Pollution', 'Other'];
  const priorities = ['All', 'Critical', 'High', 'Medium', 'Low'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
        <Navbar user={user} onLogout={logout} />
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <Navbar user={user} onLogout={logout} />

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 animate-slide-down">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Authority Command Center
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                AI-Powered Issue Management & Resolution Dashboard
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Quick Actions */}
              <button
                onClick={fetchIssues}
                className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl hover-lift border border-gray-200 dark:border-gray-700"
                title="Refresh Data"
              >
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Export Button */}
              <button className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover-lift flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
          <div className="xl:col-span-2">
            <AnimatedStatCard
              title="Total Issues"
              value={stats.total}
              icon={
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              color="blue"
              delay={0}
            />
          </div>

          <div className="xl:col-span-2">
            <AnimatedStatCard
              title="Pending"
              value={stats.pending}
              icon={
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="yellow"
              trend="down"
              trendValue={12}
              delay={100}
            />
          </div>

          <div className="xl:col-span-2">
            <AnimatedStatCard
              title="In Progress"
              value={stats.inProgress}
              icon={
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              color="purple"
              trend="up"
              trendValue={8}
              delay={200}
            />
          </div>

          <div className="xl:col-span-2">
            <AnimatedStatCard
              title="Resolved"
              value={stats.resolved}
              icon={
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="green"
              trend="up"
              trendValue={15}
              delay={300}
            />
          </div>

          <div className="xl:col-span-2">
            <AnimatedStatCard
              title="Critical Priority"
              value={stats.critical}
              icon={
                <span className="text-3xl">🔴</span>
              }
              color="red"
              delay={400}
            />
          </div>

          <div className="xl:col-span-2">
            <AnimatedStatCard
              title="High Priority"
              value={stats.highPriority}
              icon={
                <span className="text-3xl">🟠</span>
              }
              color="orange"
              delay={500}
            />
          </div>

          <div className="xl:col-span-2">
            <AnimatedStatCard
              title="Avg Resolution"
              value={stats.avgResolutionTime}
              icon={
                <span className="text-3xl">⏱️</span>
              }
              color="blue"
              suffix=" days"
              delay={600}
            />
          </div>

          <div className="xl:col-span-2">
            <AnimatedStatCard
              title="Satisfaction"
              value={stats.citizenSatisfaction}
              icon={
                <span className="text-3xl">😊</span>
              }
              color="green"
              suffix="%"
              delay={700}
            />
          </div>
        </div>

        {/* Advanced Filters & Controls */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full mr-3"></span>
              Advanced Filters & Search
            </h3>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1.5">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-gray-600 shadow-lg text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 shadow-lg text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-gray-600 shadow-lg text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Search Issues
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search by title, description, location..."
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all dark:text-white"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all dark:text-white font-semibold"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all dark:text-white font-semibold"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                AI Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all dark:text-white font-semibold"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all dark:text-white font-semibold"
              >
                <option value="priority">AI Priority</option>
                <option value="upvotes">Most Upvoted</option>
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{filteredIssues.length}</span> of{' '}
                <span className="font-bold text-gray-900 dark:text-white text-lg">{issues.length}</span> issues
              </p>

              {selectedIssues.size > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl font-bold text-sm">
                    {selectedIssues.size} selected
                  </span>
                  <button
                    onClick={() => setShowBatchActions(!showBatchActions)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Batch Actions
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={selectAllIssues}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              {selectedIssues.size === filteredIssues.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Batch Actions Panel */}
          {showBatchActions && selectedIssues.size > 0 && (
            <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-800 animate-slide-down">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Batch Operations ({selectedIssues.size} issues)
              </h4>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleBatchUpdateStatus('In Progress')}
                  className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Mark as In Progress</span>
                </button>

                <button
                  onClick={() => handleBatchUpdateStatus('Resolved')}
                  className="px-5 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Mark as Resolved</span>
                </button>

                <button
                  onClick={() => setSelectedIssues(new Set())}
                  className="px-5 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Issues Display - Cards View */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredIssues.map((issue, index) => (
              <div
                key={issue._id}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transform hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-20">
                  <input
                    type="checkbox"
                    checked={selectedIssues.has(issue._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleIssueSelection(issue._id);
                    }}
                    className="w-6 h-6 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-4 focus:ring-blue-500/30 cursor-pointer"
                  />
                </div>

                {/* Image Section */}
                {issue.imageUrl && (
                  <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                    <img
                      src={`http://localhost:5000${issue.imageUrl}`}
                      alt={issue.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      onClick={() => setSelectedIssue(issue)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Status Badge on Image */}
                    <div className="absolute top-4 right-4">
                      <StatusBadge status={issue.status} />
                    </div>
                  </div>
                )}

                {/* Content Section */}
                <div className="relative p-6 space-y-4" onClick={() => setSelectedIssue(issue)}>
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
                      </svg>
                      <span className="line-clamp-1 font-medium">{issue.location}</span>
                    </div>
                  )}

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center space-x-6">
                      {/* Upvotes */}
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4l-8 8h5v8h6v-8h5z" />
                        </svg>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{issue.upvoteCount || 0}</span>
                      </div>

                      {/* Date */}
                      <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 font-medium">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(issue.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 pt-4">
                    {issue.status === 'Pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(issue._id, 'In Progress');
                        }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                      >
                        Start Work
                      </button>
                    )}
                    {issue.status === 'In Progress' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(issue._id, 'Resolved');
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white text-sm rounded-xl font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        analyzeIssueWithAI(issue);
                      }}
                      disabled={analyzingIssues.has(issue._id) || aiAnalysis[issue._id]}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                    >
                      {analyzingIssues.has(issue._id) ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Analyzing...</span>
                        </>
                      ) : aiAnalysis[issue._id] ? (
                        <span>✓ Analyzed</span>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span>AI Analyze</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Issues Display - Table View */}
        {viewMode === 'table' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedIssues.size === filteredIssues.length && filteredIssues.length > 0}
                        onChange={selectAllIssues}
                        className="w-5 h-5 rounded border-2 border-white text-blue-600 focus:ring-4 focus:ring-blue-500/30 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Issue</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Upvotes</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredIssues.map((issue, index) => (
                    <tr
                      key={issue._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedIssue(issue)}
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIssues.has(issue._id)}
                          onChange={() => toggleIssueSelection(issue._id)}
                          className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-4 focus:ring-blue-500/30 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {issue.imageUrl && (
                            <img
                              src={`http://localhost:5000${issue.imageUrl}`}
                              alt={issue.title}
                              className="w-16 h-16 rounded-xl object-cover shadow-md"
                            />
                          )}
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{issue.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{issue.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <CategoryBadge category={issue.category} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={issue.status} />
                      </td>
                      <td className="px-6 py-4">
                        <AIPriorityBadge issue={issue} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4l-8 8h5v8h6v-8h5z" />
                          </svg>
                          <span className="font-bold text-gray-900 dark:text-white">{issue.upvoteCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {formatDate(issue.createdAt)}
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center space-x-2">
                          {issue.status === 'Pending' && (
                            <button
                              onClick={() => handleUpdateStatus(issue._id, 'In Progress')}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-semibold hover:bg-blue-700 transition-all"
                            >
                              Start
                            </button>
                          )}
                          {issue.status === 'In Progress' && (
                            <button
                              onClick={() => handleUpdateStatus(issue._id, 'Resolved')}
                              className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg font-semibold hover:bg-green-700 transition-all"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Issues Display - Kanban View */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Pending', 'In Progress', 'Resolved'].map((status) => {
              const statusIssues = filteredIssues.filter(issue => issue.status === status);
              const statusColors = {
                'Pending': 'from-yellow-500 to-orange-500',
                'In Progress': 'from-blue-500 to-indigo-500',
                'Resolved': 'from-green-500 to-emerald-500'
              };
              
              return (
                <div key={status} className="flex flex-col">
                  <div className={`bg-gradient-to-r ${statusColors[status]} text-white px-6 py-4 rounded-t-2xl shadow-lg`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">{status}</h3>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
                        {statusIssues.length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-b-2xl shadow-xl border-x border-b border-gray-200/50 dark:border-gray-700/50 p-4 space-y-4 min-h-[500px]">
                    {statusIssues.map((issue) => (
                      <div
                        key={issue._id}
                        onClick={() => setSelectedIssue(issue)}
                        className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-gray-600 hover:-translate-y-1"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <CategoryBadge category={issue.category} />
                          <AIPriorityBadge issue={issue} />
                        </div>
                        
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {issue.title}
                        </h4>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {issue.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 4l-8 8h5v8h6v-8h5z" />
                            </svg>
                            <span className="text-sm font-bold text-blue-600">{issue.upvoteCount || 0}</span>
                          </div>
                          
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(issue.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredIssues.length === 0 && (
          <div className="text-center py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
              <span className="text-6xl">🔍</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Issues Found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filters to see more results
            </p>
          </div>
        )}
      </main>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setSelectedIssue(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6 rounded-t-3xl z-10">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h2 className="text-3xl font-bold text-white mb-3">{selectedIssue.title}</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <CategoryBadge category={selectedIssue.category} />
                    <StatusBadge status={selectedIssue.status} />
                    <AIPriorityBadge issue={selectedIssue} />
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
            <div className="px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
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
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                      <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                      Description
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                      {selectedIssue.description}
                    </p>
                  </div>

                  {/* Map */}
                  {selectedIssue.latitude && selectedIssue.longitude && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                        <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                        Location Map
                      </h3>
                      <MapView
                        latitude={selectedIssue.latitude}
                        longitude={selectedIssue.longitude}
                        address={selectedIssue.location}
                        title={selectedIssue.title}
                        status={selectedIssue.status}
                        height="400px"
                      />
                    </div>
                  )}

                  {/* AI Analysis */}
                  {aiAnalysis[selectedIssue._id] && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                        <span className="w-1 h-6 bg-purple-600 rounded-full mr-3"></span>
                        🤖 AI Analysis
                      </h3>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Urgency Score</p>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                              {aiAnalysis[selectedIssue._id].urgencyScore}/10
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sentiment</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                              {aiAnalysis[selectedIssue._id].sentiment}
                            </p>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-purple-200 dark:border-purple-800">
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Suggested Action:</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {aiAnalysis[selectedIssue._id].suggestedAction}
                          </p>
                        </div>
                        <div className="pt-4 border-t border-purple-200 dark:border-purple-800 mt-4">
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Estimated Impact:</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {aiAnalysis[selectedIssue._id].estimatedImpact}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comments Section */}
                  <CommentsSection issueId={selectedIssue._id} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Timeline */}
                  <IssueTimeline issue={selectedIssue} />

                  {/* Quick Actions */}
                  <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      {selectedIssue.status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedIssue._id, 'In Progress')}
                          className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Start Working</span>
                        </button>
                      )}
                      {selectedIssue.status === 'In Progress' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedIssue._id, 'Resolved')}
                          className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Mark as Resolved</span>
                        </button>
                      )}
                      <button
                        onClick={() => analyzeIssueWithAI(selectedIssue)}
                        disabled={analyzingIssues.has(selectedIssue._id) || aiAnalysis[selectedIssue._id]}
                        className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {analyzingIssues.has(selectedIssue._id) ? (
                          <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Analyzing...</span>
                          </>
                        ) : aiAnalysis[selectedIssue._id] ? (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>✓ Analyzed</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span>AI Analyze</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Issue Details */}
                  <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Issue Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reporter</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {selectedIssue.reportedBy?.name || 'Anonymous'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reported On</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {new Date(selectedIssue.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {selectedIssue.location && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Location</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {selectedIssue.location}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAuthorityDashboard;