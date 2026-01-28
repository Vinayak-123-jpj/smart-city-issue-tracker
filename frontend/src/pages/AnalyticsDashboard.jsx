import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AnalyticsDashboard = () => {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await issueAPI.getAll();
      const allIssues = response.data;
      setIssues(allIssues);
      calculateStats(allIssues);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (allIssues) => {
    const total = allIssues.length;
    const pending = allIssues.filter(i => i.status === 'Pending').length;
    const inProgress = allIssues.filter(i => i.status === 'In Progress').length;
    const resolved = allIssues.filter(i => i.status === 'Resolved').length;
    
    const categoryBreakdown = allIssues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {});

    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;
    const totalUpvotes = allIssues.reduce((sum, issue) => sum + (issue.upvoteCount || 0), 0);
    const avgUpvotes = total > 0 ? (totalUpvotes / total).toFixed(1) : 0;
    const mostReported = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentIssues = allIssues.filter(issue => new Date(issue.createdAt) > sevenDaysAgo);

    setStats({
      total,
      pending,
      inProgress,
      resolved,
      resolutionRate,
      avgUpvotes,
      categoryBreakdown,
      mostReported,
      recentActivity: recentIssues.length,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar user={user} onLogout={logout} />
        <LoadingSpinner message="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Overview of civic issue management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Issues</p>
                <p className="text-4xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm mb-1">Pending</p>
                <p className="text-4xl font-bold">{stats.pending}</p>
              </div>
              <div className="bg-yellow-400 bg-opacity-30 p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">In Progress</p>
                <p className="text-4xl font-bold">{stats.inProgress}</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Resolved</p>
                <p className="text-4xl font-bold">{stats.resolved}</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resolution Rate</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#e5e7eb" className="dark:stroke-gray-700" strokeWidth="12" fill="none" />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#10b981"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(stats.resolutionRate / 100) * 351.86} 351.86`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.resolutionRate}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Average Upvotes</h3>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-5xl font-bold text-primary-600 dark:text-primary-400">{stats.avgUpvotes}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">per issue</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-5xl font-bold text-orange-600 dark:text-orange-400">{stats.recentActivity}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">last 7 days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Issues by Category</h3>
          <div className="space-y-4">
            {Object.entries(stats.categoryBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => {
                const percentage = ((count / stats.total) * 100).toFixed(1);
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-primary-600 dark:bg-primary-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          {stats.mostReported && (
            <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900 dark:bg-opacity-20 rounded-lg border border-primary-200 dark:border-primary-800">
              <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
                Most Reported: <span className="text-primary-600 dark:text-primary-400">{stats.mostReported[0]}</span> with {stats.mostReported[1]} issues
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AnalyticsDashboard;