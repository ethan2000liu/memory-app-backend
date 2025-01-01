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

// Update own profile
exports.updateProfile = async (req, res) => {
  const user_id = req.user.user_id;
  const { name, bio, avatar_file } = req.body;

  try {
    // Build update query based on provided fields
    let updateFields = [];
    let values = [user_id]; // Start with user_id
    let valueIndex = 2; // Start from $2 since $1 is user_id

    if (name !== undefined) {
      updateFields.push(`name = $${valueIndex}`);
      values.push(name);
      valueIndex++;
    }

    if (bio !== undefined) {
      updateFields.push(`bio = $${valueIndex}`);
      values.push(bio);
      valueIndex++;
    }

    if (avatar_file !== undefined) {
      updateFields.push(`avatar_url = $${valueIndex}`);
      values.push(avatar_file);
      valueIndex++;
    }

    // Add updated_at
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // If no fields to update
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update provided' });
    }

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING id, name, email, bio, avatar_url, created_at, updated_at;
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Error updating profile' });
  }
};

// Export both functions
module.exports = {
  getUserProfile: exports.getUserProfile,
  updateProfile: exports.updateProfile
};
  