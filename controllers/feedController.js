const db = require('../db');

// Retrieve the public feed (all public posts) or following feed
exports.getFeed = async (req, res) => {
  const { user_id, type = 'public', limit = 10, offset = 0 } = req.query;

  try {
    let query;
    let values = [parseInt(limit), parseInt(offset)];

    if (type === 'public') {
      // Public Feed: All public posts
      query = `
        SELECT id, user_id, description, file_url, tags, is_public, created_at
        FROM memories
        WHERE is_public = TRUE
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2;
      `;
    } else if (type === 'following' && user_id) {
      // Following Feed: Posts from followed users
      query = `
        SELECT m.id, m.user_id, m.description, m.file_url, m.tags, m.is_public, m.created_at
        FROM memories m
        JOIN followers f ON m.user_id = f.user_id
        WHERE f.follower_id = $3 AND m.is_public = TRUE
        ORDER BY m.created_at DESC
        LIMIT $1 OFFSET $2;
      `;
      values.push(user_id);
    } else {
      return res.status(400).json({ error: 'Invalid feed type or missing user_id for following feed' });
    }

    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving feed' });
  }
};
