import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CommentsSection = ({ issueId, initialComments = [] }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);

    try {
      // API call would go here
      // const response = await api.post(`/issues/${issueId}/comments`, { 
      //   text: newComment,
      //   parentId: replyingTo 
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const comment = {
        _id: Date.now().toString(),
        text: newComment,
        author: {
          _id: user._id,
          name: user.name,
          role: user.role
        },
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        replies: [],
        parentId: replyingTo
      };

      if (replyingTo) {
        // Add as reply
        setComments(prevComments => 
          prevComments.map(c => 
            c._id === replyingTo 
              ? { ...c, replies: [...(c.replies || []), comment] }
              : c
          )
        );
      } else {
        // Add as top-level comment
        setComments(prevComments => [comment, ...prevComments]);
      }

      setNewComment('');
      setReplyingTo(null);
      
      toast.success('Comment posted! 💬', {
        icon: '✅',
      });

    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      // API call would go here
      // await api.put(`/issues/${issueId}/comments/${commentId}`, { text: editText });

      await new Promise(resolve => setTimeout(resolve, 500));

      setComments(prevComments =>
        prevComments.map(c =>
          c._id === commentId ? { ...c, text: editText, edited: true } : c
        )
      );

      setEditingComment(null);
      setEditText('');
      toast.success('Comment updated!');

    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      // API call would go here
      // await api.delete(`/issues/${issueId}/comments/${commentId}`);

      await new Promise(resolve => setTimeout(resolve, 500));

      setComments(prevComments => 
        prevComments.filter(c => c._id !== commentId)
      );

      toast.success('Comment deleted');

    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      // API call would go here
      // await api.put(`/issues/${issueId}/comments/${commentId}/like`);

      await new Promise(resolve => setTimeout(resolve, 200));

      setComments(prevComments =>
        prevComments.map(c => {
          if (c._id === commentId) {
            const hasLiked = c.likedBy?.includes(user._id);
            return {
              ...c,
              likes: hasLiked ? c.likes - 1 : c.likes + 1,
              likedBy: hasLiked 
                ? c.likedBy.filter(id => id !== user._id)
                : [...(c.likedBy || []), user._id]
            };
          }
          return c;
        })
      );

    } catch (error) {
      toast.error('Failed to like comment');
    }
  };

  const formatTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return new Date(dateString).toLocaleDateString();
  };

  const CommentItem = ({ comment, isReply = false }) => {
    const isAuthor = comment.author._id === user._id;
    const hasLiked = comment.likedBy?.includes(user._id);

    return (
      <div className={`${isReply ? 'ml-12' : ''} animate-fade-in`}>
        <div className="flex space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              comment.author.role === 'authority'
                ? 'bg-gradient-to-br from-green-400 to-green-600 text-white ring-2 ring-green-300'
                : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
            }`}>
              {comment.author.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {comment.author.name}
                  </span>
                  {comment.author.role === 'authority' && (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                      Authority
                    </span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                  {comment.edited && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                      (edited)
                    </span>
                  )}
                </div>

                {/* Actions Dropdown */}
                {isAuthor && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingComment(comment._id);
                        setEditText(comment.text);
                      }}
                      className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      title="Edit comment"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete comment"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Comment Text */}
              {editingComment === comment._id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none dark:text-white"
                    rows="3"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditComment(comment._id)}
                      className="px-4 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingComment(null);
                        setEditText('');
                      }}
                      className="px-4 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                  {comment.text}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4 mt-2 ml-4">
              <button
                onClick={() => handleLikeComment(comment._id)}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  hasLiked
                    ? 'text-red-600 dark:text-red-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                }`}
              >
                <svg className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{comment.likes || 0}</span>
              </button>

              {!isReply && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
                >
                  Reply
                </button>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment._id && (
              <div className="mt-3 ml-4 animate-slide-down">
                <form onSubmit={handleSubmitComment} className="space-y-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none dark:text-white"
                    rows="3"
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim()}
                      className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-semibold"
                    >
                      {isSubmitting ? 'Posting...' : 'Reply'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingTo(null);
                        setNewComment('');
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-4">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply._id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <span className="w-1 h-6 bg-primary-600 rounded-full mr-3"></span>
          Comments
          <span className="ml-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full">
            {comments.length}
          </span>
        </h3>
      </div>

      {/* New Comment Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts on this issue..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none dark:text-white transition-all"
                rows="4"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pl-13">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Be respectful and constructive in your comments
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Post Comment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No comments yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsSection;