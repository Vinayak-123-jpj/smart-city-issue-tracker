import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={logout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Authority Dashboard</h2>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid gap-4">
            {issues.map((issue) => (
              <div key={issue._id} className="bg-white p-6 rounded-lg shadow cursor-pointer" onClick={() => setSelectedIssue(issue)}>
                <h3 className="font-bold text-lg">{issue.title}</h3>
                <p className="text-gray-600">{issue.description.substring(0, 100)}...</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm font-medium">👍 {issue.upvoteCount || 0}</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${issue.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {issue.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedIssue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedIssue(null)}>
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold mb-4">{selectedIssue.title}</h2>
              <p className="mb-4">{selectedIssue.description}</p>
              <div className="flex gap-2">
                <button onClick={() => handleUpdateStatus(selectedIssue._id, 'In Progress')} className="btn-primary">Mark In Progress</button>
                <button onClick={() => handleUpdateStatus(selectedIssue._id, 'Resolved')} className="bg-green-600 text-white px-4 py-2 rounded">Mark Resolved</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AuthorityDashboard;