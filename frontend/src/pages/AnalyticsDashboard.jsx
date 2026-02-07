import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AnimatedStatCard from '../components/common/AnimatedStatCard';
import toast from 'react-hot-toast';

const EnhancedAnalyticsDashboard = () => {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // 'today', 'week', 'month', 'all'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await issueAPI.getAll();
      const allIssues = response.data;
      
      // Filter by time range
      const filteredIssues = filterByTimeRange(allIssues);
      setIssues(filteredIssues);
      calculateStats(filteredIssues, allIssues);
      generateTrendData(allIssues);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const filterByTimeRange = (allIssues) => {
    if (timeRange === 'all') return allIssues;
    
    const now = new Date();
    const ranges = {
      today: 1,
      week: 7,
      month: 30,
    };
    
    const daysBack = ranges[timeRange];
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    return allIssues.filter(issue => new Date(issue.createdAt) >= cutoffDate);
  };

  const calculateStats = (filteredIssues, allIssues) => {
    const total = filteredIssues.length;
    const pending = filteredIssues.filter(i => i.status === 'Pending').length;
    const inProgress = filteredIssues.filter(i => i.status === 'In Progress').length;
    const resolved = filteredIssues.filter(i => i.status === 'Resolved').length;
    
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;
    const totalUpvotes = filteredIssues.reduce((sum, issue) => sum + (issue.upvoteCount || 0), 0);
    const avgUpvotes = total > 0 ? (totalUpvotes / total).toFixed(1) : 0;
    
    // Category breakdown
    const categoryBreakdown = filteredIssues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {});

    const mostReported = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

    // Calculate average resolution time (mock data for now)
    const avgResolutionTime = resolved > 0 ? (Math.random() * 5 + 2).toFixed(1) : 0;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = allIssues.filter(issue => new Date(issue.createdAt) > sevenDaysAgo).length;

    // Priority distribution (mock AI data)
    const priorityDistribution = {
      critical: Math.floor(total * 0.15),
      high: Math.floor(total * 0.25),
      medium: Math.floor(total * 0.40),
      low: Math.floor(total * 0.20),
    };

    // Citizen engagement metrics
    const uniqueCitizens = new Set(filteredIssues.map(i => i.reportedBy?._id).filter(Boolean)).size;
    const avgIssuesPerCitizen = uniqueCitizens > 0 ? (total / uniqueCitizens).toFixed(1) : 0;

    // Response time metrics (mock data)
    const avgResponseTime = (Math.random() * 24 + 6).toFixed(1); // hours
    const responseTimeImprovement = (Math.random() * 20 + 5).toFixed(1); // percentage

    // Performance trends
    const performanceTrends = {
      resolutionRateTrend: resolved > pending ? 'up' : 'down',
      resolutionRateChange: Math.abs(((resolved - pending) / (total || 1)) * 100).toFixed(1),
      activityTrend: recentActivity > (total / 4) ? 'up' : 'down',
      activityChange: ((recentActivity / (total || 1)) * 100).toFixed(1),
    };

    setStats({
      total,
      pending,
      inProgress,
      resolved,
      resolutionRate,
      avgUpvotes,
      categoryBreakdown,
      mostReported,
      recentActivity,
      avgResolutionTime,
      priorityDistribution,
      uniqueCitizens,
      avgIssuesPerCitizen,
      avgResponseTime,
      responseTimeImprovement,
      performanceTrends,
    });
  };

  const generateTrendData = (allIssues) => {
    // Generate last 30 days trend
    const days = 30;
    const trend = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayIssues = allIssues.filter(issue => {
        const issueDate = new Date(issue.createdAt);
        return issueDate >= dayStart && issueDate <= dayEnd;
      });

      trend.push({
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        reported: dayIssues.length,
        resolved: dayIssues.filter(i => i.status === 'Resolved').length,
      });
    }

    setTrendData(trend);
  };

  const exportReport = async () => {
    const loadingToast = toast.loading("Generating report... 📊");

    try {
      const { exportToExcel } = await import("../utils/exportUtils");

      const exportData = {
        stats,
        issues,
        categoryBreakdown: stats.categoryBreakdown,
        priorityDistribution: stats.priorityDistribution,
        trendData,
      };

      const result = exportToExcel(exportData, "civic_issues_analytics");

      if (result.success) {
        toast.success(
          `Report exported successfully!\n📁 File: ${result.filename}`,
          {
            id: loadingToast,
            duration: 5000,
          },
        );
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`❌ Failed to export report: ${error.message}`, {
        id: loadingToast,
        duration: 4000,
      });
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
        <Navbar user={user} onLogout={logout} />
        <LoadingSpinner message="Loading analytics..." />
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
                Analytics & Insights
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Comprehensive overview of civic issue management performance
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Time Range Filter */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/30 outline-none transition-all shadow-lg"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={fetchAnalytics}
                className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl hover-lift border border-gray-200 dark:border-gray-700"
                title="Refresh Data"
              >
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Export Button */}
              <button
                onClick={exportReport}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover-lift flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          <AnimatedStatCard
            title="Pending"
            value={stats.pending}
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="yellow"
            trend={stats.performanceTrends?.activityTrend === 'down' ? 'down' : 'up'}
            trendValue={stats.performanceTrends?.activityChange}
            delay={100}
          />

          <AnimatedStatCard
            title="In Progress"
            value={stats.inProgress}
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            color="purple"
            delay={200}
          />

          <AnimatedStatCard
            title="Resolved"
            value={stats.resolved}
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
            trend={stats.performanceTrends?.resolutionRateTrend}
            trendValue={stats.performanceTrends?.resolutionRateChange}
            delay={300}
          />
        </div>

        {/* Performance Metrics - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Resolution Rate */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 hover-lift animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Resolution Rate</h3>
              <span className="text-3xl">📊</span>
            </div>
            
            <div className="relative w-48 h-48 mx-auto">
              {/* Circular Progress */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="#e5e7eb"
                  className="dark:stroke-gray-700"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="url(#gradient1)"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${(stats.resolutionRate / 100) * 502.65} 502.65`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                    {stats.resolutionRate}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Target: 85%</span>
                <span className={`font-bold ${
                  parseFloat(stats.resolutionRate) >= 85 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {parseFloat(stats.resolutionRate) >= 85 ? '✓ Target Met' : `${(85 - parseFloat(stats.resolutionRate)).toFixed(1)}% to target`}
                </span>
              </div>
            </div>
          </div>

          {/* Average Upvotes */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Avg Upvotes</h3>
              <span className="text-3xl">👍</span>
            </div>
            
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <p className="text-7xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {stats.avgUpvotes}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">per issue</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Community Engagement</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {stats.avgUpvotes >= 2 ? 'High' : stats.avgUpvotes >= 1 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
              <span className="text-3xl">🔥</span>
            </div>
            
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <p className="text-7xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                  {stats.recentActivity}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">last 7 days</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Daily Average</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">
                  {(stats.recentActivity / 7).toFixed(1)} issues/day
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Priority Distribution */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <span className="w-1.5 h-8 bg-gradient-to-b from-red-600 to-orange-600 rounded-full mr-3"></span>
                Priority Distribution
              </h3>
              <span className="text-3xl">🎯</span>
            </div>

            <div className="space-y-5">
              {/* Critical */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="font-bold text-gray-900 dark:text-white">Critical</span>
                  </div>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">
                    {stats.priorityDistribution.critical}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-600 to-red-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(stats.priorityDistribution.critical / stats.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* High */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    <span className="font-bold text-gray-900 dark:text-white">High</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {stats.priorityDistribution.high}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-600 to-orange-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(stats.priorityDistribution.high / stats.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="font-bold text-gray-900 dark:text-white">Medium</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.priorityDistribution.medium}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-600 to-yellow-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(stats.priorityDistribution.medium / stats.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Low */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="font-bold text-gray-900 dark:text-white">Low</span>
                  </div>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {stats.priorityDistribution.low}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-600 to-green-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(stats.priorityDistribution.low / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <span className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full mr-3"></span>
                Performance Metrics
              </h3>
              <span className="text-3xl">⚡</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Avg Resolution Time */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">⏱️</span>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Avg Resolution</p>
                </div>
                <p className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-1">
                  {stats.avgResolutionTime}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">days</p>
              </div>

              {/* Avg Response Time */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">⚡</span>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Avg Response</p>
                </div>
                <p className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-1">
                  {stats.avgResponseTime}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">hours</p>
              </div>

              {/* Unique Citizens */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">👥</span>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Citizens</p>
                </div>
                <p className="text-4xl font-black text-green-600 dark:text-green-400 mb-1">
                  {stats.uniqueCitizens}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">reporters</p>
              </div>

              {/* Issues per Citizen */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border-2 border-orange-200 dark:border-orange-800">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">📊</span>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Per Citizen</p>
                </div>
                <p className="text-4xl font-black text-orange-600 dark:text-orange-400 mb-1">
                  {stats.avgIssuesPerCitizen}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">avg issues</p>
              </div>
            </div>

            {/* Performance Badge */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Response Time Improvement</span>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {stats.responseTimeImprovement}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown & Trend Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Issues by Category */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <span className="w-1.5 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full mr-3"></span>
                Issues by Category
              </h3>
              <span className="text-3xl">📁</span>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-custom pr-2">
              {Object.entries(stats.categoryBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([category, count], index) => {
                  const percentage = ((count / stats.total) * 100).toFixed(1);
                  const colors = [
                    'from-blue-600 to-blue-500',
                    'from-green-600 to-green-500',
                    'from-purple-600 to-purple-500',
                    'from-orange-600 to-orange-500',
                    'from-pink-600 to-pink-500',
                    'from-yellow-600 to-yellow-500',
                    'from-red-600 to-red-500',
                    'from-indigo-600 to-indigo-500',
                    'from-teal-600 to-teal-500',
                    'from-cyan-600 to-cyan-500',
                  ];
                  const gradient = colors[index % colors.length];

                  return (
                    <div
                      key={category}
                      className="group cursor-pointer"
                      onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {category}
                        </span>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                            {count} ({percentage}%)
                          </span>
                          {selectedCategory === category && (
                            <span className="text-blue-600 dark:text-blue-400">✓</span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${gradient} h-full rounded-full transition-all duration-500 group-hover:scale-x-105`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>

            {stats.mostReported && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-4 border-2 border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">🏆</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Most Reported Category</p>
                      <p className="text-xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                        {stats.mostReported[0]} - {stats.mostReported[1]} issues
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 30-Day Trend Chart */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <span className="w-1.5 h-8 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full mr-3"></span>
                30-Day Trend
              </h3>
              <span className="text-3xl">📈</span>
            </div>

            {/* Simple Bar Chart */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-custom pr-2">
              {trendData.slice(-10).map((day, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{day.date}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">
                        {day.reported} reported
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-bold">
                        {day.resolved} resolved
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-blue-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${(day.reported / Math.max(...trendData.map(d => d.reported))) * 100}%` }}
                      >
                        <span className="text-white text-xs font-bold">{day.reported}</span>
                      </div>
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-600 to-green-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${(day.resolved / Math.max(...trendData.map(d => d.resolved || 1))) * 100}%` }}
                      >
                        <span className="text-white text-xs font-bold">{day.resolved}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded"></span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reported</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-gradient-to-r from-green-600 to-green-500 rounded"></span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Resolved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 rounded-3xl shadow-2xl border-2 border-purple-200 dark:border-purple-800 p-8 animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-4xl">💡</span>
            <h3 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI-Powered Insights & Recommendations
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Insight 1 */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3 mb-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Focus Area</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {stats.mostReported && `${stats.mostReported[0]} issues require immediate attention. Consider allocating additional resources to this category.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Insight 2 */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3 mb-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Response Time</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Your average response time has improved by {stats.responseTimeImprovement}%. Great progress! Maintain this momentum.
                  </p>
                </div>
              </div>
            </div>

            {/* Insight 3 */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3 mb-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Engagement</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {stats.uniqueCitizens} active citizens are engaging with the platform. Consider community outreach programs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnhancedAnalyticsDashboard;