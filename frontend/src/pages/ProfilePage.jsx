import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';
import { issueAPI } from '../services/api';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [stats, setStats] = useState({
    issuesReported: 0,
    upvotesGiven: 0,
    issuesResolved: 0,
    contributionScore: 0,
    rank: 'Newcomer',
    level: 1,
  });

  const [achievements, setAchievements] = useState([
    { id: 1, name: 'Early Adopter', description: 'Joined the platform', icon: '🎉', unlocked: true, date: new Date() },
    { id: 2, name: 'Problem Solver', description: 'Report 10 issues', icon: '🔧', unlocked: false, progress: 0, target: 10 },
    { id: 3, name: 'Community Champion', description: 'Give 50 upvotes', icon: '👑', unlocked: false, progress: 0, target: 50 },
    { id: 4, name: 'Impact Maker', description: 'Get 100 upvotes', icon: '⭐', unlocked: false, progress: 0, target: 100 },
    { id: 5, name: 'Civic Hero', description: 'Report 50 issues', icon: '🦸', unlocked: false, progress: 0, target: 50 },
    { id: 6, name: 'Resolution Master', description: 'Get 20 issues resolved', icon: '✅', unlocked: false, progress: 0, target: 20 },
  ]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || '',
    avatar: null,
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      // Simulate API call for stats
      const mockStats = {
        issuesReported: 23,
        upvotesGiven: 45,
        issuesResolved: 12,
        contributionScore: 850,
        rank: 'Active Citizen',
        level: 5,
      };
      setStats(mockStats);

      // Update achievements based on stats
      setAchievements(prev => prev.map(achievement => {
        if (achievement.id === 2) {
          return {
            ...achievement,
            progress: mockStats.issuesReported,
            unlocked: mockStats.issuesReported >= achievement.target,
          };
        }
        if (achievement.id === 3) {
          return {
            ...achievement,
            progress: mockStats.upvotesGiven,
            unlocked: mockStats.upvotesGiven >= achievement.target,
          };
        }
        if (achievement.id === 6) {
          return {
            ...achievement,
            progress: mockStats.issuesResolved,
            unlocked: mockStats.issuesResolved >= achievement.target,
          };
        }
        return achievement;
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, avatar: file }));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validate passwords if changing
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmNewPassword) {
          toast.error('New passwords do not match!');
          setIsSaving(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          toast.error('Password must be at least 6 characters!');
          setIsSaving(false);
          return;
        }
        if (!formData.currentPassword) {
          toast.error('Current password is required to change password!');
          setIsSaving(false);
          return;
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Profile updated successfully! ✅', {
        icon: '🎉',
        style: {
          borderRadius: '12px',
          background: isDarkMode ? '#1f2937' : '#fff',
          color: isDarkMode ? '#fff' : '#333',
        },
      });
      
      setIsEditing(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }));

    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Account deleted successfully');
      logout();
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const calculateProgress = () => {
    const maxLevel = 10;
    return ((stats.level / maxLevel) * 100).toFixed(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Navbar user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-down">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
            Profile Settings
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your account and track your impact</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-gray-200 dark:border-gray-700">
              {/* Profile Header with Avatar */}
              <div className="relative bg-gradient-to-r from-primary-500 via-blue-500 to-purple-500 px-8 py-16">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative flex items-center space-x-6">
                  {/* Avatar Upload */}
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 shadow-2xl overflow-hidden border-4 border-white dark:border-gray-700 animate-scale-in">
                      {avatarPreview || user?.avatar ? (
                        <img 
                          src={avatarPreview || user?.avatar} 
                          alt={user?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-blue-500">
                          <span className="text-5xl font-bold text-white">
                            {user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-3 cursor-pointer hover:bg-primary-700 transition-all shadow-lg hover-lift">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-white mb-2">{user?.name}</h3>
                    <p className="text-white text-opacity-90 mb-3">{user?.email}</p>
                    <div className="flex items-center space-x-3 flex-wrap gap-2">
                      <span className={`inline-flex items-center px-4 py-1.5 text-sm rounded-full font-semibold shadow-lg ${
                        user?.role === 'citizen' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-green-500 text-white'
                      }`}>
                        {user?.role === 'citizen' ? '👤 Citizen' : '🛡️ Authority'}
                      </span>
                      <span className="inline-flex items-center px-4 py-1.5 text-sm rounded-full font-semibold bg-yellow-400 text-yellow-900 shadow-lg">
                        ⭐ Level {stats.level}
                      </span>
                      <span className="inline-flex items-center px-4 py-1.5 text-sm rounded-full font-semibold bg-purple-500 text-white shadow-lg">
                        {stats.rank}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Level Progress Bar */}
                <div className="relative mt-6">
                  <div className="flex justify-between text-sm text-white mb-2">
                    <span>Level {stats.level}</span>
                    <span>Level {stats.level + 1}</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                      style={{ width: `${calculateProgress()}%` }}
                    />
                  </div>
                  <p className="text-white text-opacity-75 text-xs mt-2 text-center">
                    {stats.contributionScore} / 1000 XP to next level
                  </p>
                </div>
              </div>

              {/* Form Section */}
              <div className="px-8 py-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h4>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl hover:from-primary-700 hover:to-blue-700 transition-all shadow-md hover-lift btn-press"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setAvatarPreview(null);
                          setFormData({
                            name: user?.name || '',
                            email: user?.email || '',
                            phone: user?.phone || '',
                            address: user?.address || '',
                            bio: user?.bio || '',
                            avatar: null,
                            currentPassword: '',
                            newPassword: '',
                            confirmNewPassword: '',
                          });
                        }}
                        className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors btn-press shadow-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all btn-press disabled:opacity-50 shadow-md hover-lift"
                      >
                        {isSaving ? (
                          <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="animate-slide-up">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white transition-all"
                      />
                    </div>

                    <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white transition-all"
                      />
                    </div>

                    <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="+91 9876543210"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white transition-all"
                      />
                    </div>

                    <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Your city"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows="3"
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white transition-all resize-none"
                    />
                  </div>

                  {/* Password Change Section */}
                  {isEditing && (
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700 animate-slide-down">
                      <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Change Password
                      </h5>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Enter current password"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              placeholder="Enter new password"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              name="confirmNewPassword"
                              value={formData.confirmNewPassword}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="px-8 py-6 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
                <h5 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Danger Zone
                </h5>
                <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors btn-press shadow-md hover-lift"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-fade-in border border-gray-200 dark:border-gray-700" style={{ animationDelay: '0.1s' }}>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Your Stats
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Issues Reported</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.issuesReported}</p>
                  </div>
                  <div className="text-4xl">📝</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Upvotes Given</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.upvotesGiven}</p>
                  </div>
                  <div className="text-4xl">👍</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Issues Resolved</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.issuesResolved}</p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Contribution Score</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.contributionScore}</p>
                  </div>
                  <div className="text-4xl">⭐</div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-fade-in border border-gray-200 dark:border-gray-700" style={{ animationDelay: '0.2s' }}>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Achievements
              </h4>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div 
                    key={achievement.id}
                    className={`p-4 rounded-xl border-2 transition-all hover-lift ${
                      achievement.unlocked
                        ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-300 dark:border-yellow-700'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-60'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{achievement.icon}</span>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{achievement.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                        </div>
                      </div>
                      {achievement.unlocked && (
                        <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    {!achievement.unlocked && achievement.progress !== undefined && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>{achievement.progress} / {achievement.target}</span>
                          <span>{Math.round((achievement.progress / achievement.target) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-primary-500 to-blue-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {achievement.unlocked && achievement.date && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Unlocked {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-fade-in border border-gray-200 dark:border-gray-700" style={{ animationDelay: '0.3s' }}>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Account Details
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">Active</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Security</p>
                      <p className="font-semibold text-purple-600 dark:text-purple-400">Protected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account?"
        message="This action cannot be undone. All your data will be permanently deleted."
        confirmText="Delete Account"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default ProfilePage;