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

module.exports = router;
