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

// Get account status
exports.getAccountStatus = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.bio,
        u.avatar_url,
        u.account_status,
        u.created_at,
        u.updated_at,
        auth.users.email_confirmed_at IS NOT NULL as email_verified
      FROM users u
      JOIN auth.users ON u.email = auth.users.email
      WHERE u.id = $1;
    `;
    
    const result = await db.query(query, [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Determine account status based on profile completion
    let status = user.account_status;
    if (status === 'setup-needed') {
      if (user.email_verified && user.name) {
        // If email is verified and name exists, update to semi-setup
        const updateQuery = `
          UPDATE users 
          SET account_status = 'semi-setup' 
          WHERE id = $1
          RETURNING account_status;
        `;
        const updateResult = await db.query(updateQuery, [user_id]);
        status = updateResult.rows[0].account_status;
      }
    } else if (status === 'semi-setup') {
      if (user.email_verified && user.name && user.bio && user.avatar_url) {
        // If all fields are complete, update to complete
        const updateQuery = `
          UPDATE users 
          SET account_status = 'complete' 
          WHERE id = $1
          RETURNING account_status;
        `;
        const updateResult = await db.query(updateQuery, [user_id]);
        status = updateResult.rows[0].account_status;
      }
    }

    res.json({
      status,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        avatar_url: user.avatar_url,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      requirements: {
        email_verified: user.email_verified,
        has_name: Boolean(user.name),
        has_bio: Boolean(user.bio),
        has_avatar: Boolean(user.avatar_url)
      }
    });

  } catch (err) {
    console.error('Error getting account status:', err);
    res.status(500).json({ error: 'Error getting account status' });
  }
};

// Update account status
exports.updateAccountStatus = async (req, res) => {
  const user_id = req.user.user_id;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['setup-needed', 'semi-setup', 'complete', 'suspended'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status',
      valid_statuses: validStatuses
    });
  }

  try {
    const query = `
      UPDATE users 
      SET 
        account_status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING 
        id,
        email,
        name,
        bio,
        avatar_url,
        account_status,
        created_at,
        updated_at;
    `;
    
    const result = await db.query(query, [status, user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Account status updated successfully',
      user: result.rows[0]
    });

  } catch (err) {
    console.error('Error updating account status:', err);
    res.status(500).json({ error: 'Error updating account status' });
  }
};

// Export both functions
module.exports = {
  getUserProfile: exports.getUserProfile,
  updateProfile: exports.updateProfile,
  getAccountStatus: exports.getAccountStatus,
  updateAccountStatus: exports.updateAccountStatus
};
  