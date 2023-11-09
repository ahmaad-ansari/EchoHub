require('dotenv').config(); // Ensure this is at the top to load environment variables
const cors = require('cors');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const pool = require('./db/index'); // Adjust the path as necessary
const { saveMessage } = require('./services/messageService');
const { setUserOnlineStatus } = require('./services/userService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});


// Set up a whitelist and check against it:
var whitelist = ['http://localhost:3000']; // Add any other origins you want to whitelist
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // This is important for cookies/token and client-side
};

// Then pass them to cors:
app.use(cors(corsOptions));
// Middleware to parse the body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
const messageRoutes = require('./routes/messages'); // Adjust the path as necessary
const userRoutes = require('./routes/users'); // Make sure the path is correct based on your project structure
const friendRoutes = require('./routes/friends');
app.use('/users', userRoutes);
app.use('/friends', friendRoutes);
app.use('/messages', messageRoutes);


// Authentication middleware for socket connections
const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error'));
      }
      socket.user_id = decoded.user_id; // Save the user id to the socket for future reference
      next();
    });
  } else {
    next(new Error('Authentication error'));
  }
};

io.use(socketAuthMiddleware);

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected, user_id:', socket.user_id);
  onlineUsers.set(socket.user_id, socket);

  setUserOnlineStatus(socket.user_id, true).catch((error) => {
    console.error('Error setting user online status:', error);
  });

  socket.on('joinRoom', ({ roomId }) => {
    // Leave all other rooms first (optional, if you want one room per chat session)
    console.log(`Received joinRoom event with roomId: ${roomId}`); // Log the roomId received from the client
    if (!roomId) {
      console.error('joinRoom event called with undefined roomId');
      return;
    }
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.leave(room);
      }
    }
    
    // Join the new room
    socket.join(roomId);
    console.log(`User with ID: ${socket.user_id} joined room: ${roomId}`);
  });
  
  socket.on('leaveRoom', ({ roomId }) => {
    socket.leave(roomId);
    console.log(`User with ID: ${socket.user_id} left room: ${roomId}`);
  });

  socket.on('sendMessage', async ({ roomId, text }) => {
    if (!roomId || !text) {
      console.error('sendMessage event called with missing roomId or text');
      return;
    }

    const [user1, user2] = roomId.split('_').map(Number);
    const fromUserId = socket.user_id;
    const toUserId = fromUserId === user1 ? user2 : user1;

    console.log(`Attempting to send message from ${fromUserId} to ${toUserId}: ${text}`);

    try {
      const savedMessage = await saveMessage(fromUserId, toUserId, text);
      io.to(roomId).emit('receiveMessage', savedMessage);
      console.log(`Message sent to room ${roomId}: `, savedMessage);
    } catch (error) {
      console.error('Error in sendMessage event:', error);
      socket.emit('messageSaveError', { message: 'Failed to save message.' });
    }
  });

  // New event for fetching past messages
  socket.on('getPastMessages', async ({ roomId }) => {
    if (!roomId) {
      console.error('getPastMessages event called with missing roomId');
      return;
    }

    const [user1, user2] = roomId.split('_').map(Number);
    const fromUserId = socket.user_id;
    const toUserId = fromUserId === user1 ? user2 : user1;

    try {
      const messages = await pool.query(
        'SELECT * FROM messages WHERE (from_user_id = $1 AND to_user_id = $2) OR (from_user_id = $2 AND to_user_id = $1) ORDER BY timestamp ASC',
        [fromUserId, toUserId]
      );
      socket.emit('pastMessages', messages.rows);
    } catch (error) {
      console.error('Error fetching past messages:', error);
      socket.emit('messageFetchError', { message: 'Failed to fetch past messages.' });
    }

  });

  socket.on('disconnect', () => {
    console.log(`User with ID: ${socket.user_id} disconnected`);
    onlineUsers.delete(socket.user_id);
    setUserOnlineStatus(socket.user_id, false).catch((error) => {
      console.error('Error setting user offline status:', error);
    });
    
    socket.broadcast.emit('userOffline', socket.user_id);
  });
});

// Test API Endpoint
app.get('/', (req, res) => {
  res.send('EchoHub Server is running!');
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
