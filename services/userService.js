// userService.js
const pool = require('./db');

const setUserOnlineStatus = async (userId, isOnline) => {
  try {
    await pool.query(
      'UPDATE users SET online = $1 WHERE id = $2',
      [isOnline, userId]
    );
  } catch (error) {
    console.error('Error updating user online status:', error);
    throw error;
  }
};

module.exports = {
  setUserOnlineStatus,
  // ... other user related functions ...
};
