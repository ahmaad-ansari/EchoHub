const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/index'); // Make sure this path is correct
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth'); // Make sure you have authentication middleware



// POST /users/register
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

        // Insert new user into the database
        const newUser = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );

        res.status(201).json({ message: 'User created successfully', user: newUser.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// POST /users/login
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

        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// PUT /users/update
router.put('/update', auth, async (req, res) => {
    const { username, password } = req.body;
    const userId = req.user.user_id;

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

        // Update user in the database
        const updateUser = await pool.query(
            'UPDATE users SET username = COALESCE($1, username), password = COALESCE($2, password) WHERE user_id = $3 RETURNING *',
            [username || null, hashedPassword || null, userId]
        );

        // If no rows returned, the user does not exist
        if (updateUser.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedUser = updateUser.rows[0];
        delete updatedUser.password; // Remove the password from the response

        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// DELETE /users/delete
router.delete('/delete', auth, async (req, res) => {
    const userId = req.user.user_id;

    try {
        const deleteUser = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [userId]);

        // If no rows returned, the user does not exist or has already been deleted
        if (deleteUser.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
