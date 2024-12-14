const express = require('express');
const memoryController = require('../controllers/memoryController');

const router = express.Router();

// Route to create a new memory
router.post('/', memoryController.createMemory);

// Route to retrieve all memories for a user
router.get('/user/:userId', memoryController.getMemoriesByUser);

// Route to retrieve a specific memory
router.get('/:id', memoryController.getMemoryById);

// Route to edit a memory
router.put('/:id', memoryController.editMemory);

// Route to delete a memory
router.delete('/:id', memoryController.deleteMemory);

module.exports = router;
