const express = require('express');
const memoryController = require('../controllers/memoryController');

const router = express.Router();

// Create a new memory
router.post('/', memoryController.createMemory);

// Retrieve all memories for a user
router.get('/user/:userId', memoryController.getMemoriesByUser);

// Retrieve a specific memory
router.get('/:id', memoryController.getMemoryById);

// Edit a memory
router.put('/', memoryController.editMemory);

// Delete a memory
router.delete('/', memoryController.deleteMemory);

// Toggle memory privacy
router.put('/privacy', memoryController.togglePrivacy);

module.exports = router;
