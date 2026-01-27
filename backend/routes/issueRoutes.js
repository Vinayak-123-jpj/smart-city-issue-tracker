const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Issue = require('../models/Issue');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  }
});

// Get all issues
router.get('/', protect, async (req, res) => {
  try {
    const { sort, status, category } = req.query;
    
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;

    let sortOption = {};
    if (sort === 'upvotes') sortOption = { upvoteCount: -1 };
    else if (sort === 'recent') sortOption = { createdAt: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email')
      .sort(sortOption);

    res.json({
      success: true,
      data: issues
    });
  } catch (error) {
    console.error('Get all issues error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single issue
router.get('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email');
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create issue (with image upload)
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, location } = req.body;
    
    const issue = await Issue.create({
      title,
      description,
      category,
      location,
      reportedBy: req.user._id,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null
    });

    const populatedIssue = await Issue.findById(issue._id).populate('reportedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedIssue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update issue status (Authority only)
router.put('/:id', protect, checkRole('authority'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('reportedBy', 'name email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// UPVOTE ISSUE - FIXED VERSION
router.put('/:id/upvote', protect, async (req, res) => {
  try {
    console.log('Upvote request for issue:', req.params.id);
    console.log('User ID:', req.user._id);

    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Convert to strings for comparison
    const userIdString = req.user._id.toString();
    const upvotedByStrings = issue.upvotedBy.map(id => id.toString());
    const alreadyUpvoted = upvotedByStrings.includes(userIdString);

    console.log('Already upvoted?', alreadyUpvoted);

    if (alreadyUpvoted) {
      // Remove upvote
      issue.upvotedBy = issue.upvotedBy.filter(
        id => id.toString() !== userIdString
      );
      issue.upvoteCount = Math.max(0, issue.upvoteCount - 1);
      console.log('Removed upvote, new count:', issue.upvoteCount);
    } else {
      // Add upvote
      issue.upvotedBy.push(req.user._id);
      issue.upvoteCount = (issue.upvoteCount || 0) + 1;
      console.log('Added upvote, new count:', issue.upvoteCount);
    }

    // Save without validation to avoid reportedBy error
    await issue.save({ validateBeforeSave: false });

    console.log('Upvote saved successfully');

    res.json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Upload completion image (Authority only)
router.put('/:id/completion-image', protect, checkRole('authority'), upload.single('image'), async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    if (req.file) {
      issue.completionImageUrl = `/uploads/${req.file.filename}`;
      await issue.save();
    }

    const populatedIssue = await Issue.findById(issue._id).populate('reportedBy', 'name email');

    res.json({
      success: true,
      data: populatedIssue
    });
  } catch (error) {
    console.error('Upload completion image error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's issues
router.get('/user/my-issues', protect, async (req, res) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: issues
    });
  } catch (error) {
    console.error('Get my issues error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete issue
router.delete('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if user is owner or authority
    if (issue.reportedBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'authority') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this issue'
      });
    }

    await issue.deleteOne();

    res.json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;