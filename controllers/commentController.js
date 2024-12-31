const db = require('../db'); // Import database connection

// Helper function to check ownership
const isOwner = (commentUserId, requesterId) => commentUserId === requesterId;

// Add a new comment to a memory
exports.addComment = async (req, res) => {
  const { memory_id, content } = req.body;
  const user_id = req.user.user_id; // Get from auth token

  // Validate input
  if (!memory_id || !content) {
    return res.status(400).json({ error: 'memory_id and content are required' });
  }

  try {
    // First check if the memory exists
    const memoryCheck = await db.query(
      'SELECT * FROM memories WHERE id = $1',
      [memory_id]
    );

    if (memoryCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    // First insert the comment
    const insertQuery = `
      INSERT INTO comments (memory_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;
    const insertResult = await db.query(insertQuery, [memory_id, user_id, content]);
    
    // Then get the comment with user info
    const getCommentQuery = `
      SELECT 
        comments.*,
        users.name as user_name,
        users.avatar_url as user_avatar
      FROM comments
      JOIN users ON users.id = comments.user_id
      WHERE comments.id = $1;
    `;
    const result = await db.query(getCommentQuery, [insertResult.rows[0].id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding comment:', err);
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
        comments.*,
        users.name AS user_name,
        users.avatar_url AS user_avatar
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
    console.error('Error retrieving comments:', err);
    res.status(500).json({ error: 'Error retrieving comments' });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  const { comment_id } = req.body;
  const user_id = req.user.user_id; // Get from auth token

  if (!comment_id) {
    return res.status(400).json({ error: 'comment_id is required' });
  }

  try {
    // Check if user owns the comment
    const comment = await db.query(
      'SELECT * FROM comments WHERE id = $1',
      [comment_id]
    );

    if (comment.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.rows[0].user_id !== user_id) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await db.query(
      'DELETE FROM comments WHERE id = $1',
      [comment_id]
    );

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Error deleting comment' });
  }
};
