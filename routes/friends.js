const express = require('express');
const router = express.Router();
const pool = require('../db/index'); // Importing the database connection - ensure the path is correct
const auth = require('../middleware/auth'); // Importing authentication middleware

// POST /friends/request - Send a friend request
router.post('/request', auth, async (req, res) => {
    const { to_user_id } = req.body; // ID of the user to whom the request is sent
    const from_user_id = req.user.user_id; // ID of the user sending the request, obtained from auth middleware

    try {
        // Prevent sending a request to oneself
        if (to_user_id === from_user_id) {
            return res.status(400).json({ message: "You can't send a friend request to yourself" });
        }

        // Check if request already exists or if they are already friends
        const existingRequestOrFriend = await pool.query(
            'SELECT * FROM friend_requests WHERE (from_user_id = $1 AND to_user_id = $2) OR (from_user_id = $2 AND to_user_id = $1)',
            [from_user_id, to_user_id]
        );

        if (existingRequestOrFriend.rows.length > 0) {
            return res.status(400).json({ message: 'Friend request already sent or you are already friends' });
        }

        // Send friend request
        const newRequest = await pool.query(
            'INSERT INTO friend_requests (from_user_id, to_user_id) VALUES ($1, $2) RETURNING *',
            [from_user_id, to_user_id]
        );

        res.json(newRequest.rows[0]); // Respond with details of the sent friend request
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// POST /friends/accept - Accept a friend request
router.post('/accept', auth, async (req, res) => {
    const { request_id } = req.body; // ID of the friend request
    const user_id = req.user.user_id; // Authenticated user ID from the token

    try {
        // Begin a transaction
        await pool.query('BEGIN');

        // Fetch the friend request to ensure it's valid and directed to the authenticated user
        const request = await pool.query(
            'SELECT * FROM friend_requests WHERE request_id = $1 AND to_user_id = $2 AND status = $3 FOR UPDATE',
            [request_id, user_id, 'pending']
        );

        if (request.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Friend request not found or already handled' });
        }

        // Update the friend request status to 'accepted'
        await pool.query(
            'UPDATE friend_requests SET status = $1 WHERE request_id = $2',
            ['accepted', request_id]
        );

        // Commit the transaction
        await pool.query('COMMIT');

        res.status(200).json({ message: 'Friend request accepted', request: request.rows[0] });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// DELETE /friends/reject - Reject a friend request
router.delete('/reject', auth, async (req, res) => {
    const { request_id } = req.body; // ID of the friend request
    const user_id = req.user.user_id; // Authenticated user ID from the token

    try {
        // Fetch the friend request to ensure it's valid and directed to the authenticated user
        const request = await pool.query(
            'SELECT * FROM friend_requests WHERE request_id = $1 AND to_user_id = $2 AND status = $3',
            [request_id, user_id, 'pending']
        );

        if (request.rows.length === 0) {
            return res.status(404).json({ message: 'Friend request not found or not pending' });
        }

        // Delete the friend request
        await pool.query(
            'DELETE FROM friend_requests WHERE request_id = $1',
            [request_id]
        );

        // Send a response to confirm the deletion
        res.json({ message: 'Friend request rejected and deleted successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// DELETE /friends/remove - Remove a friend
router.delete('/remove', auth, async (req, res) => {
    const { friend_id } = req.body; // ID of the friend to remove
    const user_id = req.user.user_id; // Authenticated user ID from the token

    try {
        // Begin a transaction
        await pool.query('BEGIN');

        // Check if the friendship exists
        const friendship = await pool.query(
            `SELECT * FROM friend_requests 
             WHERE ((from_user_id = $1 AND to_user_id = $2) OR (from_user_id = $2 AND to_user_id = $1))
             AND status = 'accepted' FOR UPDATE`,
            [user_id, friend_id]
        );

        if (friendship.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Friendship not found' });
        }

        // Delete the friendship
        await pool.query(
            `DELETE FROM friend_requests 
             WHERE (from_user_id = $1 AND to_user_id = $2) OR (from_user_id = $2 AND to_user_id = $1)`,
            [user_id, friend_id]
        );

        // Commit the transaction
        await pool.query('COMMIT');

        res.json({ message: 'Friendship removed successfully.' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// GET /friends - List all friends
router.get('/', auth, async (req, res) => {
    const user_id = req.user.user_id; // Authenticated user ID from the token

    try {
        // Fetch all accepted friend requests where the user is either the sender or receiver
        const friends = await pool.query(
            `SELECT u.user_id, u.username
             FROM users u
             INNER JOIN friend_requests fr
             ON (u.user_id = fr.from_user_id OR u.user_id = fr.to_user_id)
             AND (fr.from_user_id = $1 OR fr.to_user_id = $1)
             AND fr.status = 'accepted'
             AND u.user_id != $1`,
            [user_id]
        );

        res.json(friends.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// GET /friends/requests - List all friend requests
router.get('/requests', auth, async (req, res) => {
    const user_id = req.user.user_id; // Authenticated user ID from the token

    try {
        // Fetch all pending friend requests sent by or to the user
        const friendRequests = await pool.query(
            `SELECT fr.request_id, fr.from_user_id, fr.to_user_id, fr.status, 
                    u_from.username as from_username, u_to.username as to_username
             FROM friend_requests fr
             JOIN users u_from ON fr.from_user_id = u_from.user_id
             JOIN users u_to ON fr.to_user_id = u_to.user_id
             WHERE (fr.from_user_id = $1 OR fr.to_user_id = $1)
             AND fr.status = 'pending'`,
            [user_id]
        );

        res.json(friendRequests.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
