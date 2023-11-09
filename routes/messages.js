// routes/messages.js
const express = require('express');
const router = express.Router();
const { getMessages } = require('../services/messageService');
const auth = require('../middleware/auth'); // Make sure you have authentication middleware

router.get('/:contactUserId', auth, async (req, res) => {
  try {
    const user_id = req.user.id; // Assuming your auth middleware sets `req.user`
    const { contactUserId } = req.params;
    const messages = await getMessages(user_id, contactUserId);
    res.json(messages);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

router.get('/messages/:userId', async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.user.user_id; // Assuming your authentication middleware sets this

  try {
    const messages = await pool.query(
      "SELECT * FROM messages WHERE (from_user_id = $1 AND to_user_id = $2) OR (from_user_id = $2 AND to_user_id = $1) ORDER BY timestamp",
      [currentUser, userId]
    );
    res.json(messages.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages", error: err });
  }
});

module.exports = router;
