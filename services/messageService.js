// messageService.js
const pool = require('../db/index'); // Assuming db.js is the setup for your PostgreSQL pool

const saveMessage = async (fromUserId, toUserId, text) => {
  try {
    const insertQuery = `INSERT INTO messages (from_user_id, to_user_id, message_text, timestamp)
                         VALUES ($1, $2, $3, NOW()) RETURNING *`;
    const values = [fromUserId, toUserId, text];
    const result = await pool.query(insertQuery, values);
    return result.rows[0]; // Return the saved message
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

// Add a new function to get past messages
const getPastMessages = async (fromUserId, toUserId) => {
    try {
      const messagesQuery = `SELECT * FROM messages 
                             WHERE (from_user_id = $1 AND to_user_id = $2) 
                             OR (from_user_id = $2 AND to_user_id = $1) 
                             ORDER BY timestamp ASC`;
      const values = [fromUserId, toUserId];
      const messages = await pool.query(messagesQuery, values);
      return messages.rows;
    } catch (error) {
      console.error('Error fetching past messages:', error);
      throw error; // Rethrow the error to handle it in the calling function
    }
  };

  
module.exports = {
saveMessage,
getPastMessages,
};
