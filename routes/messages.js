const express = require('express');
const router = express.Router();
const { getMessages } = require('../services/messageService');
const auth = require('../middleware/auth'); // Authentication middleware
const pool = require('../db/index'); // Database connection assuming this file interacts directly with the database

// GET /messages/:contactUserId - Get messages with a specific contact user
router.get('/:contactUserId', auth, async (req, res) => {
  try {
    const user_id = req.user.id; // Assuming your auth middleware sets `req.user`
    const { contactUserId } = req.params;
    const messages = await getMessages(user_id, contactUserId); // Fetch messages from the service
    res.json(messages);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// GET /messages/messages/:userId - Get messages between two users
router.get('/messages/:userId', async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.user.user_id; // Assuming your authentication middleware sets this

  try {
    // Fetch messages between two users from the database
    const messages = await pool.query(
      "SELECT * FROM messages WHERE (from_user_id = $1 AND to_user_id = $2) OR (from_user_id = $2 AND to_user_id = $1) ORDER BY timestamp",
      [currentUser, userId]
    );
    res.json(messages.rows); // Send the fetched messages in the response
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages", error: err });
  }
});

module.exports = router;