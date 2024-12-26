const db = require('../db');

const userModel = {
  createUser: async (userData) => {
    const query = `
      INSERT INTO users (
        id,
        email,
        name,
        avatar_url,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      userData.id,
      userData.email,
      userData.name || null,
      userData.avatar_url || null,
      new Date(),
      new Date()
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  getUserById: async (id) => {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  updateUser: async (id, userData) => {
    const query = `
      UPDATE users 
      SET 
        name = COALESCE($1, name),
        avatar_url = COALESCE($2, avatar_url),
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    const values = [
      userData.name,
      userData.avatar_url,
      id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }
};

module.exports = userModel; 