const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/index'); // Database connection
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth'); // Authentication middleware
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Destination for file uploads

// POST /users/register - Register a new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  if (username.length < 4 || password.length < 6) {
    return res.status(400).json({ message: 'Username must be at least 4 characters and password at least 6 characters long' });
  }

  try {
    // Check if username exists
    const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default profile image URL
    const defaultProfileImageUrl = '/uploads/default_profile_image.jpg'; // Replace with your actual default image URL

    // Insert new user into the database
    const newUser = await pool.query(
      'INSERT INTO users (username, password, profile_image_url) VALUES ($1, $2, $3) RETURNING *',
      [username, hashedPassword, defaultProfileImageUrl]
    );

    res.status(201).json({ message: 'User created successfully', user: newUser.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});


// POST /users/login - User login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // User matched, send JWT
    const token = jwt.sign({ user_id: user.rows[0].user_id }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token expires in 1 hour
    });

    res.json({ token: token, user_id: user.rows[0].user_id, username: user.rows[0].username, profile_image_url: user.rows[0].profile_image_url });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// PUT /users/update - Update user details
router.put('/update', upload.single('profileImage'), auth, async (req, res) => {
  const { username, password } = req.body;
  const userId = req.user.user_id;
  const profileImage = req.file;

  try {
    // Check if the new username is already taken by another user
    if (username) {
      const userWithSameUsername = await pool.query('SELECT * FROM users WHERE username = $1 AND user_id != $2', [username, userId]);
      if (userWithSameUsername.rows.length > 0) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    // Hash new password if provided
    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Handle profile image path
    let imagePath = null;
    if (profileImage) {
      imagePath = `/uploads/${profileImage.filename}`;
    }

    // Update user in the database
    const updateUserQuery = `
      UPDATE users
      SET username = COALESCE($1, username),
          password = COALESCE($2, password),
          profile_image_url = COALESCE($3, profile_image_url)
      WHERE user_id = $4
      RETURNING *;
    `;

    const updateUser = await pool.query(updateUserQuery, [username || null, hashedPassword || null, imagePath || null, userId]);

    if (updateUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = updateUser.rows[0];
    delete updatedUser.password;

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});


// DELETE /users/delete - Delete user and associated data
router.delete('/delete', auth, async (req, res) => {
  const userId = req.user.user_id;

  try {
    await pool.query('BEGIN');

    // Delete messages sent by or to the user
    await pool.query('DELETE FROM messages WHERE from_user_id = $1 OR to_user_id = $1', [userId]);

    // Delete friend requests involving the user
    await pool.query('DELETE FROM friend_requests WHERE from_user_id = $1 OR to_user_id = $1', [userId]);

    // Delete the user
    const deleteUser = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [userId]);

    if (deleteUser.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'User not found' });
    }

    await pool.query('COMMIT');
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error.message);
    res.status(500).send('Server error');
  }
});


// GET /users/all - Get all users except the authenticated user
router.get('/all', auth, async (req, res) => {
  const user_id = req.user.user_id; // Authenticated user ID from the token

  try {
    const users = await pool.query(
      'SELECT user_id, username FROM users WHERE user_id != $1',
      [user_id]
    );
    res.json(users.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
