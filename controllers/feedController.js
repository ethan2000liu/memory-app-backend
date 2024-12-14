const db = require('../db'); // Import database connection

// Fetch all posts for the feed
exports.getFeed = async (req, res) => {
  try {
    const query = `
      SELECT 
        feed.id, 
        feed.user_id, 
        feed.memory_id, 
        feed.likes_count, 
        feed.comments_count, 
        feed.created_at, 
        memories.description, 
        memories.file_url, 
        users.name AS user_name
      FROM feed
      JOIN memories ON feed.memory_id = memories.id
      JOIN users ON feed.user_id = users.id
      ORDER BY feed.created_at DESC;
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving feed' });
  }
};

// Add a new feed item
exports.addToFeed = async (req, res) => {
  const { user_id, memory_id } = req.body;
  try {
    const query = `
      INSERT INTO feed (user_id, memory_id, likes_count, comments_count)
      VALUES ($1, $2, 0, 0)
      RETURNING *;
    `;
    const values = [user_id, memory_id];
    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding to feed' });
  }
};
