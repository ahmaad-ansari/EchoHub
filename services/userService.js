// userService.js

const pool = require('../db/index'); // Import the database connection pool

// Function to update the online status of a user in the database
const setUserOnlineStatus = async (userId, isOnline) => {
  try {
    // Update the 'online' status of the user in the 'users' table
    await pool.query(
      'UPDATE users SET online = $1 WHERE user_id = $2',
      [isOnline, userId]
    );
  } catch (error) {
    console.error('Error updating user online status:', error); // Log any errors that occur during the update
    throw error; // Throw the error for handling it in the calling function
  }
};

// Export the setUserOnlineStatus function along with other user-related functions
module.exports = {
  setUserOnlineStatus,
};
