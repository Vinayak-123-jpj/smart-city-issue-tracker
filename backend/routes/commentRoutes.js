const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access issueId
const {
  getComments,
  addComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Routes for /api/issues/:issueId/comments
router.route('/')
  .get(getComments)
  .post(protect, addComment);

// Route for /api/comments/:id
router.delete('/:id', protect, deleteComment);

module.exports = router;