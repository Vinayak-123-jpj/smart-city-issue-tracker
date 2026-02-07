import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { issueAPI } from "../services/api";
import Navbar from "../components/layout/Navbar";
import IssueCard from "../components/issues/IssueCard";
import CreateIssueForm from "../components/issues/CreateIssueForm";
import IssueFilters from "../components/issues/IssueFilters";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import StatusBadge from "../components/common/StatusBadge";
import CategoryBadge from "../components/common/CategoryBadge";
import EmptyState from "../components/common/EmptyState";
import ImageZoom from "../components/common/ImageZoom";
import AIChatbot from "../components/common/AIChatbot";


import {
  IssueCardSkeleton,
  StatCardSkeleton,
} from "../components/common/Skeleton";
import toast from "react-hot-toast";

const CitizenDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [upvoting, setUpvoting] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    category: "All",
    sort: "upvotes",
  });

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await issueAPI.getAll({ sort: filters.sort });
      setIssues(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load issues");
      toast.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleCreateIssue = async (formData) => {
    try {
      setIsSubmitting(true);
      await issueAPI.create(formData);
      setShowCreateForm(false);
      toast.success("Issue reported successfully! 🎉", {
        icon: "✅",
      });
      fetchIssues();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create issue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (issueId) => {
    try {
      setUpvoting(issueId);
      const response = await issueAPI.upvote(issueId);

      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue._id === issueId
            ? {
                ...issue,
                upvoteCount: response.data.upvoteCount,
                upvotedBy: response.data.upvotedBy,
              }
            : issue,
        ),
      );

      toast.success("Vote updated! 👍", {
        duration: 1500,
        icon: "🗳️",
      });
    } catch (err) {
      console.error("Upvote error:", err);
      toast.error(err.response?.data?.message || "Failed to upvote");
    } finally {
      setUpvoting(null);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const getFilteredIssues = () => {
    let filtered = [...issues];
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchLower) ||
          issue.description.toLowerCase().includes(searchLower),
      );
    }
    if (filters.status !== "All") {
      filtered = filtered.filter((issue) => issue.status === filters.status);
    }
    if (filters.category !== "All") {
      filtered = filtered.filter(
        (issue) => issue.category === filters.category,
      );
    }
    return filtered;
  };

  const filteredIssues = getFilteredIssues();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Personalized Welcome Header */}
        <div className="mb-8 animate-slide-down bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="text-white mb-4 sm:mb-0">
              <h2 className="text-4xl font-bold mb-2">
                {getGreeting()}, {user?.name?.split(" ")[0] || "Citizen"}! 👋
              </h2>
              <p className="text-white/90 text-lg">
                Track and manage civic issues in your community
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Report Issue</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover-lift card-enter">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Issues</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {issues.length}
                  </p>
                </div>
                <div className="bg-primary-100 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div
              className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover-lift card-enter"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {issues.filter((i) => i.status === "Pending").length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div
              className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover-lift card-enter"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {issues.filter((i) => i.status === "In Progress").length}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div
              className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover-lift card-enter"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {issues.filter((i) => i.status === "Resolved").length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        {!loading && !error && issues.length > 0 && (
          <IssueFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            issueCount={filteredIssues.length}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <IssueCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && <ErrorMessage message={error} onRetry={fetchIssues} />}

        {/* Empty State - No Issues */}
        {!loading && !error && issues.length === 0 && (
          <EmptyState
            title="No issues reported yet"
            description="Be the first to report an issue and help improve our city!"
            actionLabel="Report First Issue"
            onAction={() => setShowCreateForm(true)}
            icon={
              <svg
                className="w-full h-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          />
        )}

        {/* Empty State - No Results */}
        {!loading &&
          !error &&
          issues.length > 0 &&
          filteredIssues.length === 0 && (
            <EmptyState
              title="No issues found"
              description="Try adjusting your filters to see more results"
              iconColor="text-blue-400"
              icon={
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            />
          )}

        {/* Issues Grid */}
        {!loading && !error && filteredIssues.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {filteredIssues.map((issue, index) => (
              <div
                key={issue._id}
                className="relative card-enter h-full"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <IssueCard
                  issue={issue}
                  onClick={() => setSelectedIssue(issue)}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpvote(issue._id);
                  }}
                  disabled={upvoting === issue._id}
                  className={`absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-lg transition-all border border-gray-200 ${
                    upvoting === issue._id
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-primary-50 hover:border-primary-500 hover:scale-110 btn-press"
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-5 h-5 text-primary-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 4l-8 8h5v8h6v-8h5z" />
                    </svg>
                    <span className="text-sm font-bold text-primary-600">
                      {upvoting === issue._id ? "..." : issue.upvoteCount || 0}
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Issue Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Report New Issue
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Help improve our city
              </p>
            </div>
            <div className="px-6 py-6">
              <CreateIssueForm
                onSubmit={handleCreateIssue}
                onCancel={() => setShowCreateForm(false)}
                isSubmitting={isSubmitting}
                existingIssues={issues}
              />
            </div>
          </div>
        </div>
      )}

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedIssue(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedIssue.title}
                </h2>
                <div className="flex items-center space-x-3 mt-2">
                  <CategoryBadge category={selectedIssue.category} />
                  <StatusBadge status={selectedIssue.status} />
                  <span className="text-sm text-gray-600">
                    👍 {selectedIssue.upvoteCount || 0} upvotes
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors hover-scale"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="px-6 py-6 space-y-6">
              {selectedIssue.imageUrl && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Issue Image
                  </h3>
                  <ImageZoom
                    src={`http://localhost:5000${selectedIssue.imageUrl}`}
                    alt={selectedIssue.title}
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Description
                </h3>
                <p className="text-gray-900 leading-relaxed">
                  {selectedIssue.description}
                </p>
              </div>
              {selectedIssue.location && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Location
                  </h3>
                  <div className="flex items-center text-gray-900">
                    <svg
                      className="w-5 h-5 mr-2 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{selectedIssue.location}</span>
                  </div>
                </div>
              )}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    Reported{" "}
                    {new Date(selectedIssue.createdAt).toLocaleDateString(
                      "en-US",
                      { month: "long", day: "numeric", year: "numeric" },
                    )}
                  </span>
                  {selectedIssue.reportedBy && (
                    <span>By {selectedIssue.reportedBy.name}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* AI Chatbot - Floating Assistant */}
      <AIChatbot user={user} existingIssues={issues} />
    </div>
  );
};

export default CitizenDashboard;
