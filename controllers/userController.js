const db = require('../db');

// Get user profile
exports.getUserProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT id, name, email, avatar_url, created_at 
      FROM users 
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting user profile:', err);
    res.status(500).json({ error: 'Error getting user profile' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const authenticatedUserId = req.user.user_id;
  const { name, avatar_url } = req.body;

  // Check if user is updating their own profile
  if (id !== authenticatedUserId) {
    return res.status(403).json({ 
      error: 'You can only update your own profile' 
    });
  }

  try {
    const query = `
      UPDATE users 
      SET 
        name = COALESCE($1, name),
        avatar_url = COALESCE($2, avatar_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, name, email, avatar_url, created_at, updated_at
    `;
    const result = await db.query(query, [name, avatar_url, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Error updating user profile' });
  }
};

// Export both functions
module.exports = {
  getUserProfile: exports.getUserProfile,
  updateUserProfile: exports.updateUserProfile
};
  