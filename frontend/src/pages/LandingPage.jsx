import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Smart City Tracker</h1>
                <p className="text-xs text-gray-500">Civic Issue Management System</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
            Welcome to Smart City Portal
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A digital platform connecting citizens and authorities for efficient civic issue management and resolution
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Citizen Card */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-transparent hover:border-blue-500 transition-all duration-300 overflow-hidden group">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white">
              <div className="flex justify-center mb-4">
                <div className="bg-white bg-opacity-20 p-4 rounded-full">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-center mb-2">Citizen</h3>
              <p className="text-center text-blue-100">Report and track civic issues</p>
            </div>
            <div className="p-8">
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Report city issues with photos</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Upvote important issues</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Track issue status in real-time</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Comment and engage</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/login/citizen')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                Login as Citizen
              </button>
            </div>
          </div>

          {/* Authority Card */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-transparent hover:border-green-500 transition-all duration-300 overflow-hidden group">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 text-white">
              <div className="flex justify-center mb-4">
                <div className="bg-white bg-opacity-20 p-4 rounded-full">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-center mb-2">Authority</h3>
              <p className="text-center text-green-100">Manage and resolve issues</p>
            </div>
            <div className="p-8">
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">View all reported issues</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Update issue status</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Prioritize by upvotes</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Analytics dashboard</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/login/authority')}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
              >
                Login as Authority
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Platform Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Issues Reported</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">350+</div>
              <div className="text-gray-600">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">1000+</div>
              <div className="text-gray-600">Active Citizens</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Use Smart City Tracker?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="font-bold text-lg mb-2">Fast Response</h4>
              <p className="text-gray-600 text-sm">Get quick acknowledgment and updates on your reported issues</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🔒</div>
              <h4 className="font-bold text-lg mb-2">Secure & Reliable</h4>
              <p className="text-gray-600 text-sm">Your data is protected with industry-standard security</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="font-bold text-lg mb-2">Transparent Process</h4>
              <p className="text-gray-600 text-sm">Track every step from report to resolution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2026 Smart City Tracker. All rights reserved.</p>
          <p className="text-gray-500 text-sm mt-2">Building better cities together</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;