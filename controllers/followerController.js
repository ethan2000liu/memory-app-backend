const db = require('../db'); // Import database connection

// Follow a user
exports.followUser = async (req, res) => {
  const { user_id, follower_id } = req.body;

  if (!user_id || !follower_id) {
    return res.status(400).json({ error: 'user_id and follower_id are required' });
  }

  if (user_id === follower_id) {
    return res.status(400).json({ error: 'You cannot follow yourself' });
  }

  try {
    const query = `
      INSERT INTO followers (user_id, follower_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, follower_id) DO NOTHING
      RETURNING *;
    `;
    const result = await db.query(query, [user_id, follower_id]);

    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'You are already following this user' });
    }

    res.status(201).json({ message: 'Followed successfully', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error following user' });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  const { user_id, follower_id } = req.body;

  if (!user_id || !follower_id) {
    return res.status(400).json({ error: 'user_id and follower_id are required' });
  }

  try {
    const query = `
      DELETE FROM followers
      WHERE user_id = $1 AND follower_id = $2
      RETURNING *;
    `;
    const result = await db.query(query, [user_id, follower_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'You are not following this user' });
    }

    res.json({ message: 'Unfollowed successfully', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error unfollowing user' });
  }
};

// Get a user's followers
exports.getFollowers = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT u.id, u.name, u.avatar_url, u.created_at
      FROM followers f
      JOIN users u ON f.follower_id = u.id
      WHERE f.user_id = $1;
    `;
    const result = await db.query(query, [userId]);

    res.json({ followers: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving followers' });
  }
};

// Get users a specific user is following
exports.getFollowing = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT u.id, u.name, u.avatar_url, u.created_at
      FROM followers f
      JOIN users u ON f.user_id = u.id
      WHERE f.follower_id = $1;
    `;
    const result = await db.query(query, [userId]);

    res.json({ following: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving following list' });
  }
};
