// Import required packages and modules
require('dotenv').config(); // Load environment variables from a .env file
const cors = require('cors');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const pool = require('./db/index'); // Database connection
const { saveMessage } = require('./services/messageService'); // Import message service
const { setUserOnlineStatus } = require('./services/userService'); // Import user service
const winston = require('winston'); // Logging library
const messageService = require('./services/messageService');


// Configure winston for logging
const logger = winston.createLogger({
  // Log level and format
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => `[${info.timestamp}] [${info.level.toUpperCase()}] ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: 'server.log' }) // Log to a file
  ]
});

const app = express(); // Create Express application
const server = http.createServer(app); // Create HTTP server using Express app
const io = socketIo(server, {
  // Configure socket.io
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// CORS setup
var whitelist = ['http://localhost:3000'];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions)); // Use CORS middleware
app.use(express.json()); // Parse incoming JSON
app.use(express.urlencoded({ extended: true })); // Parse incoming URL-encoded data

// Import routes
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const friendRoutes = require('./routes/friends');
app.use('/users', userRoutes); // Set up user routes
app.use('/friends', friendRoutes); // Set up friend routes
app.use('/messages', messageRoutes); // Set up message routes

// Middleware for socket authentication
io.use((socket, next) => {
  // Verify JWT token for socket connections
  const token = socket.handshake.auth.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error'));
      }
      socket.user_id = decoded.user_id; // Store user ID in the socket
      next();
    });
  } else {
    next(new Error('Authentication error'));
  }
});

// Track online users
const onlineUsers = new Map();

// Socket.io event handling
io.on('connection', (socket) => {
  // When a new client connects
  logger.info(`New client connected, user_id: ${socket.user_id}`);
  onlineUsers.set(socket.user_id, socket); // Store user's socket

  // Set user's online status
  setUserOnlineStatus(socket.user_id, true).catch((error) => {
    logger.error(`Error setting user online status: ${error}`);
  });

  // Joining/leaving rooms, sending/receiving messages, and disconnections
  socket.on('joinRoom', ({ roomId }) => {
    if (!roomId) {
      logger.error('joinRoom event called with undefined roomId');
      return;
    }
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.leave(room);
      }
    }
    socket.join(roomId);
    logger.info(`User with ID: ${socket.user_id} joined room: ${roomId}`);
  });

  socket.on('leaveRoom', ({ roomId }) => {
    socket.leave(roomId);
    logger.info(`User with ID: ${socket.user_id} left room: ${roomId}`);
  });

  socket.on('sendMessage', async ({ roomId, text }) => {
    if (!roomId || !text) {
      logger.error('sendMessage event called with missing roomId or text');
      return;
    }

    const [user1, user2] = roomId.split('_').map(Number);
    const fromUserId = socket.user_id;
    const toUserId = fromUserId === user1 ? user2 : user1;

    logger.info(`Attempting to send message from ${fromUserId} to ${toUserId}: ${text}`);

    try {
      const savedMessage = await saveMessage(fromUserId, toUserId, text);
      io.to(roomId).emit('receiveMessage', savedMessage);
      logger.info(`Message sent to room ${roomId}: ${JSON.stringify(savedMessage)}`);
    } catch (error) {
      logger.error(`Error in sendMessage event: ${error}`);
      socket.emit('messageSaveError', { message: 'Failed to save message.' });
    }
  });

  socket.on('getPastMessages', async ({ roomId }) => {
    if (!roomId) {
      logger.error('getPastMessages event called with missing roomId');
      return;
    }

    const [user1, user2] = roomId.split('_').map(Number);
    const fromUserId = socket.user_id;
    const toUserId = fromUserId === user1 ? user2 : user1;

    try {
      const messages = await messageService.getPastMessages(fromUserId, toUserId); // Use the new function from messageService
      socket.emit('pastMessages', messages);
    } catch (error) {
      logger.error(`Error fetching past messages: ${error}`);
      socket.emit('messageFetchError', { message: 'Failed to fetch past messages.' });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`User with ID: ${socket.user_id} disconnected`);
    onlineUsers.delete(socket.user_id);
    setUserOnlineStatus(socket.user_id, false).catch((error) => {
      logger.error(`Error setting user offline status: ${error}`);
    });
  });
});

// Set up default route
app.get('/', (req, res) => {
  res.send('EchoHub Server is running!');
});

// Serve static files (e.g., uploaded files)
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error(`Unhandled exception: ${error.stack}`);
  res.status(500).send('Something broke!');
});

// Define the port for the server to listen on
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});