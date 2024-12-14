const db = require('../db'); // Import database connection

// Like a post
exports.likePost = async (req, res) => {
  const { post_id, user_id } = req.body;

  if (!post_id || !user_id) {
    return res.status(400).json({ error: 'post_id and user_id are required' });
  }

  try {
    // Check if the user already liked the post
    const checkQuery = `
      SELECT * FROM likes
      WHERE post_id = $1 AND user_id = $2;
    `;
    const checkResult = await db.query(checkQuery, [post_id, user_id]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'User has already liked this post' });
    }

    // Insert a new like
    const insertQuery = `
      INSERT INTO likes (post_id, user_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const insertResult = await db.query(insertQuery, [post_id, user_id]);

    // Update likes_count in feed
    const updateQuery = `
      UPDATE feed
      SET likes_count = likes_count + 1
      WHERE id = $1;
    `;
    await db.query(updateQuery, [post_id]);

    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error liking post' });
  }
};

// Unlike a post
exports.unlikePost = async (req, res) => {
  const { post_id, user_id } = req.body;

  if (!post_id || !user_id) {
    return res.status(400).json({ error: 'post_id and user_id are required' });
  }

  try {
    // Check if the user has already liked the post
    const checkQuery = `
      SELECT * FROM likes
      WHERE post_id = $1 AND user_id = $2;
    `;
    const checkResult = await db.query(checkQuery, [post_id, user_id]);

    if (checkResult.rows.length === 0) {
      return res.status(400).json({ error: 'Cannot unlike because the post is not liked' });
    }

    // Delete the like
    const deleteQuery = `
      DELETE FROM likes
      WHERE post_id = $1 AND user_id = $2
      RETURNING *;
    `;
    const deleteResult = await db.query(deleteQuery, [post_id, user_id]);

    // Update likes_count in feed
    const updateQuery = `
      UPDATE feed
      SET likes_count = likes_count - 1
      WHERE id = $1;
    `;
    await db.query(updateQuery, [post_id]);

    res.json(deleteResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error unliking post' });
  }
};

// Retrieve all likes for a specific post
exports.getLikesByPostId = async (req, res) => {
  const { postId } = req.params;

  try {
    const query = `
      SELECT 
        likes.user_id, 
        likes.created_at, 
        users.name AS user_name
      FROM likes
      JOIN users ON likes.user_id = users.id
      WHERE likes.post_id = $1;
    `;
    const result = await db.query(query, [postId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving likes' });
  }
};
