const userModel = require('../models/userModel');

const userController = {
  getUserProfile: async (req, res) => {
    try {
      const user = await userModel.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateUserProfile: async (req, res) => {
    try {
      const updatedUser = await userModel.updateUser(req.params.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController;
  