const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat - Public endpoint accessible to candidates, recruiters, and guests
router.post('/', chatController.handleChat);

module.exports = router;
