const Comment = require('../models/Comment');
const Issue = require('../models/Issue');

// @desc    Get all comments for an issue
// @route   GET /api/issues/:issueId/comments
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ issue: req.params.issueId })
      .populate('user', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Add a comment to an issue
// @route   POST /api/issues/:issueId/comments
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    // Check if issue exists
    const issue = await Issue.findById(req.params.issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Create comment
    const comment = await Comment.create({
      issue: req.params.issueId,
      user: req.user.id,
      text,
      isOfficial: req.user.role === 'authority', // Mark as official if from authority
    });

    // Populate user data
    await comment.populate('user', 'name role');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message,
    });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if user owns the comment or is authority
    if (comment.user.toString() !== req.user.id && req.user.role !== 'authority') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};