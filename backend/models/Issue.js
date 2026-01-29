const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide issue title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide issue description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Roads',
      'Water Supply',
      'Electricity',
      'Garbage',
      'Streetlights',
      'Drainage',
      'Parks',
      'Public Transport',
      'Noise Pollution',
      'Other'
    ]
  },
  location: {
    type: String,
    required: [true, 'Please provide location']
  },
  // Geospatial coordinates for map display
  latitude: {
    type: Number,
    default: null,
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    default: null,
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  completionImageUrl: {
    type: String,
    default: null
  },
  upvoteCount: {
    type: Number,
    default: 0,
    min: 0
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  commentCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexes for better query performance
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ category: 1 });
issueSchema.index({ reportedBy: 1 });
issueSchema.index({ upvoteCount: -1 });

// Geospatial index for location-based queries
issueSchema.index({ latitude: 1, longitude: 1 });

// Compound index for filtered queries
issueSchema.index({ status: 1, category: 1, createdAt: -1 });

// Text index for search functionality
issueSchema.index({ 
  title: 'text', 
  description: 'text', 
  location: 'text' 
});

// Virtual for checking if issue has coordinates
issueSchema.virtual('hasLocation').get(function() {
  return this.latitude !== null && this.longitude !== null;
});

// Instance method to check if user has upvoted
issueSchema.methods.hasUserUpvoted = function(userId) {
  return this.upvotedBy.some(id => id.toString() === userId.toString());
};

// Static method to get issues within radius
issueSchema.statics.findNearby = async function(lat, lng, radiusInKm = 10) {
  // Note: This is a simple implementation
  // For production, consider using MongoDB's geospatial queries with 2dsphere index
  const issues = await this.find({
    latitude: { $exists: true, $ne: null },
    longitude: { $exists: true, $ne: null }
  });

  return issues.filter(issue => {
    const distance = calculateDistance(lat, lng, issue.latitude, issue.longitude);
    return distance <= radiusInKm;
  });
};

// Helper function for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Middleware to update commentCount when needed
issueSchema.pre('save', function(next) {
  // Ensure upvoteCount matches upvotedBy array length
  if (this.isModified('upvotedBy')) {
    this.upvoteCount = this.upvotedBy.length;
  }
  next();
});

// Static method to get analytics
issueSchema.statics.getAnalytics = async function() {
  const total = await this.countDocuments();
  const pending = await this.countDocuments({ status: 'Pending' });
  const inProgress = await this.countDocuments({ status: 'In Progress' });
  const resolved = await this.countDocuments({ status: 'Resolved' });

  const categoryBreakdown = await this.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  return {
    total,
    pending,
    inProgress,
    resolved,
    resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) : 0,
    categoryBreakdown
  };
};

// Configure toJSON to include virtuals
issueSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;