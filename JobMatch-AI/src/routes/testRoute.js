const express = require('express');
const router = express.Router();

// GET /api/test
router.get(['/', '/test'], (req, res) => {
  res.status(200).json({ message: 'Day 3 Tutorial Complete' });
});

module.exports = router;
