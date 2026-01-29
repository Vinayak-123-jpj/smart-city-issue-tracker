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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'));
  }
});

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Get all issues with advanced filtering
router.get('/', protect, async (req, res) => {
  try {
    const { 
      sort, 
      status, 
      category, 
      lat, 
      lng, 
      radius = 10, // default 10km radius
      search 
    } = req.query;
    
    // Build query
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;
    
    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOption = {};
    if (sort === 'upvotes') sortOption = { upvoteCount: -1 };
    else if (sort === 'recent') sortOption = { createdAt: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };
    else sortOption = { createdAt: -1 }; // Default to recent

    let issues = await Issue.find(query)
      .populate('reportedBy', 'name email')
      .sort(sortOption);

    // Filter by location radius if coordinates provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius);

      issues = issues.filter(issue => {
        if (issue.latitude && issue.longitude) {
          const distance = calculateDistance(
            userLat, 
            userLng, 
            issue.latitude, 
            issue.longitude
          );
          return distance <= maxRadius;
        }
        return false;
      });
    }

    res.json({
      success: true,
      count: issues.length,
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

// Get nearby issues
router.get('/nearby', protect, async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = parseFloat(radius);

    // Get all issues with coordinates
    const allIssues = await Issue.find({
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null }
    }).populate('reportedBy', 'name email');

    // Filter by distance
    const nearbyIssues = allIssues.filter(issue => {
      const distance = calculateDistance(
        userLat,
        userLng,
        issue.latitude,
        issue.longitude
      );
      return distance <= maxRadius;
    }).map(issue => {
      const issueObj = issue.toObject();
      issueObj.distance = calculateDistance(
        userLat,
        userLng,
        issue.latitude,
        issue.longitude
      ).toFixed(2);
      return issueObj;
    }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

    res.json({
      success: true,
      count: nearbyIssues.length,
      radius: maxRadius,
      data: nearbyIssues
    });
  } catch (error) {
    console.error('Get nearby issues error:', error);
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
      .populate('reportedBy', 'name email role');
    
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

// Create issue (with image upload and coordinates)
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      location, 
      latitude, 
      longitude 
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, and location'
      });
    }

    // Create issue data
    const issueData = {
      title,
      description,
      category,
      location,
      reportedBy: req.user._id,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null
    };

    // Add coordinates if provided
    if (latitude && longitude) {
      issueData.latitude = parseFloat(latitude);
      issueData.longitude = parseFloat(longitude);
    }

    const issue = await Issue.create(issueData);

    const populatedIssue = await Issue.findById(issue._id)
      .populate('reportedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: populatedIssue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create issue'
    });
  }
});

// Update issue status (Authority only)
router.put('/:id', protect, checkRole('authority'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
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
      message: 'Issue status updated successfully',
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

// Upvote/Remove upvote issue
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
    const upvotedByStrings = (issue.upvotedBy || []).map(id => id.toString());
    const alreadyUpvoted = upvotedByStrings.includes(userIdString);

    console.log('Already upvoted?', alreadyUpvoted);

    if (alreadyUpvoted) {
      // Remove upvote
      issue.upvotedBy = issue.upvotedBy.filter(
        id => id.toString() !== userIdString
      );
      issue.upvoteCount = Math.max(0, (issue.upvoteCount || 0) - 1);
      console.log('Removed upvote, new count:', issue.upvoteCount);
    } else {
      // Add upvote
      if (!issue.upvotedBy) issue.upvotedBy = [];
      issue.upvotedBy.push(req.user._id);
      issue.upvoteCount = (issue.upvoteCount || 0) + 1;
      console.log('Added upvote, new count:', issue.upvoteCount);
    }

    // Save without validation to avoid reportedBy error
    await issue.save({ validateBeforeSave: false });

    console.log('Upvote saved successfully');

    res.json({
      success: true,
      message: alreadyUpvoted ? 'Upvote removed' : 'Issue upvoted',
      data: {
        upvoteCount: issue.upvoteCount,
        upvotedBy: issue.upvotedBy
      }
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    issue.completionImageUrl = `/uploads/${req.file.filename}`;
    await issue.save();

    const populatedIssue = await Issue.findById(issue._id)
      .populate('reportedBy', 'name email');

    res.json({
      success: true,
      message: 'Completion image uploaded successfully',
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

// Get user's reported issues
router.get('/user/my-issues', protect, async (req, res) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: issues.length,
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

// Get issue statistics (for analytics)
router.get('/stats/analytics', protect, checkRole('authority'), async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const pendingIssues = await Issue.countDocuments({ status: 'Pending' });
    const inProgressIssues = await Issue.countDocuments({ status: 'In Progress' });
    const resolvedIssues = await Issue.countDocuments({ status: 'Resolved' });

    // Category breakdown
    const categoryStats = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Issues by status over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentIssues = await Issue.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const recentResolved = await Issue.countDocuments({
      status: 'Resolved',
      updatedAt: { $gte: thirtyDaysAgo }
    });

    // Average resolution time
    const resolvedWithDates = await Issue.find({
      status: 'Resolved',
      updatedAt: { $exists: true }
    }).select('createdAt updatedAt');

    let avgResolutionTime = 0;
    if (resolvedWithDates.length > 0) {
      const totalTime = resolvedWithDates.reduce((sum, issue) => {
        const diff = new Date(issue.updatedAt) - new Date(issue.createdAt);
        return sum + diff;
      }, 0);
      avgResolutionTime = Math.floor(totalTime / resolvedWithDates.length / (1000 * 60 * 60 * 24)); // in days
    }

    // Top upvoted issues
    const topUpvoted = await Issue.find()
      .sort({ upvoteCount: -1 })
      .limit(5)
      .select('title upvoteCount status category')
      .populate('reportedBy', 'name');

    res.json({
      success: true,
      data: {
        overview: {
          total: totalIssues,
          pending: pendingIssues,
          inProgress: inProgressIssues,
          resolved: resolvedIssues,
          resolutionRate: totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0
        },
        categoryBreakdown: categoryStats,
        recentActivity: {
          last30Days: recentIssues,
          recentlyResolved: recentResolved
        },
        performance: {
          avgResolutionTimeDays: avgResolutionTime
        },
        topIssues: topUpvoted
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete issue (owner or authority only)
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
    const isOwner = issue.reportedBy.toString() === req.user._id.toString();
    const isAuthority = req.user.role === 'authority';

    if (!isOwner && !isAuthority) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this issue'
      });
    }

    // Only allow deletion if issue is still pending (unless authority)
    if (issue.status !== 'Pending' && !isAuthority) {
      return res.status(403).json({
        success: false,
        message: 'Can only delete pending issues'
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

// Bulk update issues status (Authority only) - for mass operations
router.put('/bulk/update-status', protect, checkRole('authority'), async (req, res) => {
  try {
    const { issueIds, status } = req.body;

    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of issue IDs'
      });
    }

    if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const result = await Issue.updateMany(
      { _id: { $in: issueIds } },
      { status, updatedAt: Date.now() }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} issues`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;