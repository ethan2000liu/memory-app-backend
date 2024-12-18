const db = require('../db'); // Import database connection

// Helper function to check ownership
const isOwner = (commentUserId, requesterId) => commentUserId === requesterId;

// Add a new comment to a memory
exports.addComment = async (req, res) => {
  const { memory_id, user_id, content } = req.body;

  // Validate input
  if (!memory_id || !user_id || !content) {
    return res.status(400).json({ error: 'memory_id, user_id, and content are required' });
  }

  try {
    const query = `
      INSERT INTO comments (memory_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [memory_id, user_id, content];
    const result = await db.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding comment' });
  }
};

// Retrieve all comments for a specific memory
exports.getCommentsByMemoryId = async (req, res) => {
  const { memoryId } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  try {
    const query = `
      SELECT 
        comments.id, 
        comments.user_id, 
        comments.content, 
        comments.created_at, 
        users.name AS user_name
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.memory_id = $1
      ORDER BY comments.created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const values = [memoryId, parseInt(limit), parseInt(offset)];
    const result = await db.query(query, values);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving comments' });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  const { commentId, requester_id } = req.body;

  try {
    // Check if the comment exists and retrieve its user_id
    const checkQuery = `SELECT * FROM comments WHERE id = $1;`;
    const checkResult = await db.query(checkQuery, [commentId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = checkResult.rows[0];
    if (!isOwner(comment.user_id, requester_id)) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Delete the comment
    const deleteQuery = `DELETE FROM comments WHERE id = $1 RETURNING *;`;
    const deleteResult = await db.query(deleteQuery, [commentId]);

    res.json({ message: 'Comment deleted successfully', comment: deleteResult.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting comment' });
  }
};
