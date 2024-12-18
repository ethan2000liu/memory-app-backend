const db = require('../db');

// Retrieve the public or following feed
exports.getFeed = async (req, res) => {
  const { user_id, type = 'public', limit = 10, offset = 0 } = req.query;

  // Validate pagination parameters
  const parsedLimit = parseInt(limit);
  const parsedOffset = parseInt(offset);
  if (isNaN(parsedLimit) || isNaN(parsedOffset) || parsedLimit <= 0 || parsedOffset < 0) {
    return res.status(400).json({ error: 'Invalid limit or offset' });
  }

  try {
    let query;
    let values = [parsedLimit, parsedOffset];

    if (type === 'public') {
      // Public Feed: All public posts
      query = `
        SELECT m.id, m.user_id, m.description, m.file_url, m.tags, m.is_public, m.created_at,
               u.name AS user_name, u.avatar_url,
               COALESCE(f.likes_count, 0) AS likes_count,
               COALESCE(f.comments_count, 0) AS comments_count
        FROM memories m
        LEFT JOIN users u ON m.user_id = u.id
        LEFT JOIN feed f ON m.id = f.memory_id
        WHERE m.is_public = TRUE
        ORDER BY m.created_at DESC
        LIMIT $1 OFFSET $2;
      `;
    } else if (type === 'following' && user_id) {
      // Following Feed: Posts from followed users
      query = `
        SELECT m.id, m.user_id, m.description, m.file_url, m.tags, m.is_public, m.created_at,
               u.name AS user_name, u.avatar_url,
               COALESCE(f.likes_count, 0) AS likes_count,
               COALESCE(f.comments_count, 0) AS comments_count
        FROM memories m
        JOIN followers fl ON m.user_id = fl.user_id
        LEFT JOIN users u ON m.user_id = u.id
        LEFT JOIN feed f ON m.id = f.memory_id
        WHERE fl.follower_id = $3 AND m.is_public = TRUE
        ORDER BY m.created_at DESC
        LIMIT $1 OFFSET $2;
      `;
      values.push(user_id);
    } else {
      return res.status(400).json({ error: 'Invalid feed type or missing user_id for following feed' });
    }

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No posts found in the feed' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving feed' });
  }
};
