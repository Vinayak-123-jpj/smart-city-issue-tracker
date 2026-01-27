const Issue = require('../models/Issue');

// @desc    Get all issues
// @route   GET /api/issues
exports.getAllIssues = async (req, res) => {
  try {
    const { status, category, sort } = req.query;
    
    // Build query
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;

    // Execute query with population
    let issues = Issue.find(query)
      .populate('createdBy', 'name email role')
      .select('-__v');

    // Sorting
    if (sort === 'upvotes') {
      issues = issues.sort({ upvoteCount: -1, createdAt: -1 });
    } else if (sort === 'oldest') {
      issues = issues.sort({ createdAt: 1 });
    } else {
      issues = issues.sort({ createdAt: -1 }); // newest first (default)
    }

    const result = await issues;

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get single issue
// @route   GET /api/issues/:id
exports.getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('createdBy', 'name email role phone')
      .populate('upvotes', 'name');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Create new issue (Citizens only)
// @route   POST /api/issues
exports.createIssue = async (req, res) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    const issue = await Issue.create(req.body);

    // Populate user data
    await issue.populate('createdBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: issue,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: error.message,
    });
  }
};

// @desc    Update issue status (Authority only)
// @route   PUT /api/issues/:id
exports.updateIssue = async (req, res) => {
  try {
    const { status, assignedTo, priority } = req.body;

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status, assignedTo, priority },
      {
        new: true,
        runValidators: true,
      }
    ).populate('createdBy', 'name email role');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: issue,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Update failed',
      error: error.message,
    });
  }
};

// @desc    Delete issue (Authority only)
// @route   DELETE /api/issues/:id
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Upvote an issue (Citizens only)
// @route   PUT /api/issues/:id/upvote
exports.upvoteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Check if user already upvoted
    const alreadyUpvoted = issue.upvotes.includes(req.user.id);

    if (alreadyUpvoted) {
      // Remove upvote
      issue.upvotes = issue.upvotes.filter(
        (userId) => userId.toString() !== req.user.id
      );
      issue.upvoteCount = issue.upvotes.length;
    } else {
      // Add upvote
      issue.upvotes.push(req.user.id);
      issue.upvoteCount = issue.upvotes.length;
    }

    await issue.save();

    res.status(200).json({
      success: true,
      message: alreadyUpvoted ? 'Upvote removed' : 'Issue upvoted',
      data: {
        upvoteCount: issue.upvoteCount,
        hasUpvoted: !alreadyUpvoted,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get user's own issues (Citizens only)
// @route   GET /api/issues/user/my-issues
exports.getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};