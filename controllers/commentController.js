const db = require('../db'); // Import database connection

// Add a new comment to a post
exports.addComment = async (req, res) => {
  const { post_id, user_id, content } = req.body;

  // Validate input
  if (!post_id || !user_id || !content) {
    return res.status(400).json({ error: 'post_id, user_id, and content are required' });
  }

  try {
    const query = `
      INSERT INTO comments (post_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [post_id, user_id, content];
    const result = await db.query(query, values);

    // Optionally, update the comments count in the feed
    const updateQuery = `
      UPDATE feed
      SET comments_count = comments_count + 1
      WHERE id = $1;
    `;
    await db.query(updateQuery, [post_id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding comment' });
  }
};

// Retrieve all comments for a specific post
exports.getCommentsByPostId = async (req, res) => {
  const { postId } = req.params;

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
      WHERE comments.post_id = $1
      ORDER BY comments.created_at DESC;
    `;
    const result = await db.query(query, [postId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving comments' });
  }
};
