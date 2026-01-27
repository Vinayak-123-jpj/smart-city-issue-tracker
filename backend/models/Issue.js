const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
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
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
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
    default: 0
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  commentCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
issueSchema.index({ status: 1, upvoteCount: -1 });
issueSchema.index({ reportedBy: 1 });
issueSchema.index({ category: 1 });
issueSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Issue', issueSchema);