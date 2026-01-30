import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import CategoryBadge from '../components/common/CategoryBadge';
import toast from 'react-hot-toast';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on status and category
const getMarkerIcon = (status, category) => {
  const statusColors = {
    'Pending': 'yellow',
    'In Progress': 'blue',
    'Resolved': 'green'
  };
  
  const color = statusColors[status] || 'red';
  
  // Create custom icon with emoji based on category
  const categoryEmojis = {
    'Roads': '🛣️',
    'Water Supply': '💧',
    'Electricity': '⚡',
    'Garbage': '🗑️',
    'Streetlights': '💡',
    'Drainage': '🌊',
    'Parks': '🌳',
    'Public Transport': '🚌',
    'Noise Pollution': '🔊',
    'Other': '📋'
  };

  const emoji = categoryEmojis[category] || '📍';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-pin marker-${color}" style="position: relative;">
        <div style="
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 20px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">${emoji}</div>
      </div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  });
};

// Simple Heatmap using Circle overlays
const HeatmapCircles = ({ issues }) => {
  const getIntensity = (status) => {
    return status === 'Pending' ? 1.0 : status === 'In Progress' ? 0.6 : 0.3;
  };

  const getColor = (status) => {
    return status === 'Pending' ? '#ef4444' : status === 'In Progress' ? '#f59e0b' : '#22c55e';
  };

  return (
    <>
      {issues.map((issue) => (
        <Circle
          key={`heat-${issue._id}`}
          center={[issue.latitude, issue.longitude]}
          radius={200}
          pathOptions={{
            fillColor: getColor(issue.status),
            fillOpacity: getIntensity(issue.status) * 0.3,
            color: getColor(issue.status),
            weight: 1,
            opacity: 0.5
          }}
        />
      ))}
    </>
  );
};

// Map bounds updater component
const MapBoundsUpdater = ({ issues }) => {
  const map = useMap();

  useEffect(() => {
    if (issues.length > 0) {
      const validIssues = issues.filter(issue => issue.latitude && issue.longitude);
      if (validIssues.length > 0) {
        const bounds = L.latLngBounds(
          validIssues.map(issue => [issue.latitude, issue.longitude])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [issues, map]);

  return null;
};

const MapDashboard = () => {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [mapCenter] = useState([23.2599, 77.4126]); // Bhopal, India
  const [mapZoom] = useState(12);

  // Filters
  const [filters, setFilters] = useState({
    status: 'All',
    category: 'All',
    search: '',
    dateRange: 'all'
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0
  });

  useEffect(() => {
    fetchIssues();
    // Set up auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchIssues, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await issueAPI.getAll();
      // Filter out issues without location data
      const issuesWithLocation = response.data.filter(
        issue => issue.latitude && issue.longitude
      );
      setIssues(issuesWithLocation);
      calculateStats(issuesWithLocation);
      
      if (response.data.length !== issuesWithLocation.length) {
        toast(`${response.data.length - issuesWithLocation.length} issues don't have location data`, {
          icon: 'ℹ️',
          duration: 2000
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (issuesData) => {
    setStats({
      total: issuesData.length,
      pending: issuesData.filter(i => i.status === 'Pending').length,
      inProgress: issuesData.filter(i => i.status === 'In Progress').length,
      resolved: issuesData.filter(i => i.status === 'Resolved').length,
      critical: Math.floor(issuesData.length * 0.15) // Mock critical count
    });
  };

  const getFilteredIssues = () => {
    let filtered = [...issues];

    // Status filter
    if (filters.status !== 'All') {
      filtered = filtered.filter(issue => issue.status === filters.status);
    }

    // Category filter
    if (filters.category !== 'All') {
      filtered = filtered.filter(issue => issue.category === filters.category);
    }

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

    return filtered;
  };

  const filteredIssues = getFilteredIssues();

  const categories = ['All', 'Roads', 'Water Supply', 'Electricity', 'Garbage', 'Streetlights', 'Drainage', 'Parks', 'Public Transport', 'Noise Pollution', 'Other'];

  if (loading && issues.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
        <Navbar user={user} onLogout={logout} />
        <LoadingSpinner message="Loading map dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <Navbar user={user} onLogout={logout} />

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 animate-slide-down">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                🗺️ Interactive Map Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Visualize and manage civic issues in real-time across the city
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Refresh Button */}
              <button
                onClick={fetchIssues}
                className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl hover-lift border border-gray-200 dark:border-gray-700"
                title="Refresh Data"
              >
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Heatmap Toggle */}
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 ${
                  showHeatmap
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>{showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Total Issues</p>
                <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {filteredIssues.length}
                </p>
              </div>
              <div className="text-4xl">📍</div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-yellow-200 dark:border-yellow-900 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Pending</p>
                <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400">
                  {filteredIssues.filter(i => i.status === 'Pending').length}
                </p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-blue-200 dark:border-blue-900 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">In Progress</p>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                  {filteredIssues.filter(i => i.status === 'In Progress').length}
                </p>
              </div>
              <div className="text-4xl">🔧</div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-green-200 dark:border-green-900 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Resolved</p>
                <p className="text-3xl font-black text-green-600 dark:text-green-400">
                  {filteredIssues.filter(i => i.status === 'Resolved').length}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-red-200 dark:border-red-900 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Critical</p>
                <p className="text-3xl font-black text-red-600 dark:text-red-400">{stats.critical}</p>
              </div>
              <div className="text-4xl">🔴</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search issues..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
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
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-bold text-blue-600 dark:text-blue-400">{filteredIssues.length}</span> of{' '}
              <span className="font-bold text-gray-900 dark:text-white">{issues.length}</span> issues on map
            </p>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="h-[700px] relative">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Heatmap Layer (using circles) */}
              {showHeatmap && <HeatmapCircles issues={filteredIssues} />}

              {/* Marker Clustering */}
              {!showHeatmap && (
                <MarkerClusterGroup
                  chunkedLoading
                  spiderfyOnMaxZoom={true}
                  showCoverageOnHover={true}
                  zoomToBoundsOnClick={true}
                  maxClusterRadius={60}
                >
                  {filteredIssues.map((issue) => (
                    <Marker
                      key={issue._id}
                      position={[issue.latitude, issue.longitude]}
                      icon={getMarkerIcon(issue.status, issue.category)}
                      eventHandlers={{
                        click: () => setSelectedIssue(issue)
                      }}
                    >
                      <Popup>
                        <div className="p-2 min-w-[250px]">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-gray-900 pr-2">{issue.title}</h3>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            <StatusBadge status={issue.status} />
                            <CategoryBadge category={issue.category} />
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {issue.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 4l-8 8h5v8h6v-8h5z" />
                              </svg>
                              {issue.upvoteCount || 0} upvotes
                            </span>
                            <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                          </div>

                          <button
                            onClick={() => setSelectedIssue(issue)}
                            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                          >
                            View Details
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              )}

              {/* Update map bounds when filters change */}
              <MapBoundsUpdater issues={filteredIssues} />
            </MapContainer>

            {/* Map Legend */}
            <div className="absolute bottom-6 right-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 z-[1000] border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Map Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Pending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">In Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Resolved</span>
                </div>
              </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl">
                  <LoadingSpinner message="Updating map..." />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {filteredIssues.length === 0 && !loading && (
          <div className="mt-6 text-center py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Issues Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters to see more results
            </p>
          </div>
        )}
      </main>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[2000] animate-fade-in" 
          onClick={() => setSelectedIssue(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-t-3xl z-10">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold text-white mb-3">{selectedIssue.title}</h2>
                  <div className="flex flex-wrap gap-3">
                    <CategoryBadge category={selectedIssue.category} />
                    <StatusBadge status={selectedIssue.status} />
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-6 space-y-6">
              {/* Image */}
              {selectedIssue.imageUrl && (
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={`http://localhost:5000${selectedIssue.imageUrl}`}
                    alt={selectedIssue.title}
                    className="w-full"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                <p className="text-gray-900 dark:text-white leading-relaxed bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  {selectedIssue.description}
                </p>
              </div>

              {/* Location */}
              {selectedIssue.location && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location</h3>
                  <div className="flex items-center text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{selectedIssue.location}</span>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Reported:</span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                      {new Date(selectedIssue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Upvotes:</span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                      {selectedIssue.upvoteCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .marker-pin {
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          position: relative;
          transform: rotate(-45deg);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }

        .marker-pin::after {
          content: '';
          width: 20px;
          height: 20px;
          margin: 5px;
          background: white;
          position: absolute;
          border-radius: 50%;
        }

        .marker-yellow {
          background-color: #eab308;
          border: 2px solid #ca8a04;
        }

        .marker-blue {
          background-color: #3b82f6;
          border: 2px solid #2563eb;
        }

        .marker-green {
          background-color: #22c55e;
          border: 2px solid #16a34a;
        }

        .marker-red {
          background-color: #ef4444;
          border: 2px solid #dc2626;
        }

        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};

export default MapDashboard;