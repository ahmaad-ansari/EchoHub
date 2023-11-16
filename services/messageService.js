// messageService.js

const pool = require('../db/index'); // Import the database connection pool (assumed to be for PostgreSQL)

// Function to save a message in the database
const saveMessage = async (fromUserId, toUserId, text) => {
  try {
    // Query to insert a new message into the 'messages' table
    const insertQuery = `INSERT INTO messages (from_user_id, to_user_id, message_text, timestamp)
                         VALUES ($1, $2, $3, NOW()) RETURNING *`;
    const values = [fromUserId, toUserId, text];
    const result = await pool.query(insertQuery, values); // Execute the query
    return result.rows[0]; // Return the saved message
  } catch (error) {
    console.error('Error saving message:', error); // Log any errors that occur during message saving
    throw error; // Throw the error for handling it in the calling function
  }
};

// Function to retrieve past messages between two users
const getPastMessages = async (fromUserId, toUserId) => {
  try {
    // Query to fetch past messages between two users from the 'messages' table
    const messagesQuery = `SELECT * FROM messages 
                           WHERE (from_user_id = $1 AND to_user_id = $2) 
                           OR (from_user_id = $2 AND to_user_id = $1) 
                           ORDER BY timestamp ASC`;
    const values = [fromUserId, toUserId];
    const messages = await pool.query(messagesQuery, values); // Execute the query
    return messages.rows; // Return the fetched past messages
  } catch (error) {
    console.error('Error fetching past messages:', error); // Log any errors that occur during fetching messages
    throw error; // Rethrow the error to handle it in the calling function
  }
};

// Export the saveMessage and getPastMessages functions
module.exports = {
  saveMessage,
  getPastMessages,
};
