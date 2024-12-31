const express = require('express');
const memoryController = require('../controllers/memoryController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All memory routes should be protected
router.use(authMiddleware);

// Put specific routes before parameter routes
router.get('/all', memoryController.getAllMemories);
router.put('/privacy', memoryController.togglePrivacy);

// Then put parameter routes
router.get('/user/:userId', memoryController.getMemoriesByUser);
router.get('/:id', memoryController.getMemoryById);

// Other routes
router.post('/', memoryController.createMemory);
router.put('/', memoryController.editMemory);
router.delete('/', memoryController.deleteMemory);

module.exports = router;
