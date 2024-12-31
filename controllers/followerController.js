const db = require('../db');

// Follow a user
exports.followUser = async (req, res) => {
  const follower_id = req.user.user_id; // Get from auth token
  const { user_id } = req.body; // ID of user to follow

  if (!user_id) {
    return res.status(400).json({ error: 'user_id of user to follow is required' });
  }

  // Prevent following yourself
  if (user_id === follower_id) {
    return res.status(400).json({ error: 'You cannot follow yourself' });
  }

  try {
    // Check if already following
    const checkQuery = `
      SELECT * FROM followers 
      WHERE follower_id = $1 AND user_id = $2
    `;
    const checkResult = await db.query(checkQuery, [follower_id, user_id]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Create follow relationship
    const query = `
      INSERT INTO followers (follower_id, user_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await db.query(query, [follower_id, user_id]);

    res.status(201).json({
      message: 'Successfully followed user',
      follow: result.rows[0]
    });
  } catch (err) {
    console.error('Error following user:', err);
    res.status(500).json({ error: 'Error following user' });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  const follower_id = req.user.user_id; // Get from auth token
  const { user_id } = req.body; // ID of user to unfollow

  if (!user_id) {
    return res.status(400).json({ error: 'user_id of user to unfollow is required' });
  }

  try {
    const query = `
      DELETE FROM followers
      WHERE follower_id = $1 AND user_id = $2
      RETURNING *;
    `;
    const result = await db.query(query, [follower_id, user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Follow relationship not found' });
    }

    res.json({ message: 'Successfully unfollowed user' });
  } catch (err) {
    console.error('Error unfollowing user:', err);
    res.status(500).json({ error: 'Error unfollowing user' });
  }
};

// Get followers of a user
exports.getFollowers = async (req, res) => {
  const { userId } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  try {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.avatar_url,
        f.created_at as followed_at
      FROM followers f
      JOIN users u ON f.follower_id = u.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const result = await db.query(query, [userId, limit, offset]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error getting followers:', err);
    res.status(500).json({ error: 'Error getting followers' });
  }
};

// Get users that a user is following
exports.getFollowing = async (req, res) => {
  const { userId } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  try {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.avatar_url,
        f.created_at as followed_at
      FROM followers f
      JOIN users u ON f.user_id = u.id
      WHERE f.follower_id = $1
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const result = await db.query(query, [userId, limit, offset]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error getting following:', err);
    res.status(500).json({ error: 'Error getting following' });
  }
};
