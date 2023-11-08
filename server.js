require('dotenv').config(); // Ensure this is at the top to load environment variables
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const pool = require('./db/index'); // Adjust the path as necessary
const { saveMessage } = require('./services/messageService');
const { setUserOnlineStatus } = require('./services/userService');
const cors = require('cors');




const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Setup Socket.IO

// Middleware to parse the body
app.use(express.json());
app.use(cors()); // This will allow all CORS requests. For production, you should configure this with more restrictions.
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

// Setup Socket.IO
io.on('connection', (socket) => {
  console.log('New client connected');
  onlineUsers.set(socket.user_id, socket);

  setUserOnlineStatus(socket.user_id, true).catch((error) => {
    console.error(error);
  });

  socket.on('joinRoom', ({ userId }) => {
    socket.join(userId);
    console.log(`User with ID: ${userId} joined room: ${userId}`);
  });

  socket.on('sendMessage', async ({ toUserId, text }) => {
    const fromUserId = socket.user_id;
    const recipientSocket = onlineUsers.get(toUserId);

    try {
      const savedMessage = await saveMessage(fromUserId, toUserId, text);
      
      // Emit the message to the recipient if they're connected
      if (recipientSocket) {
        recipientSocket.emit('receiveMessage', savedMessage);
      }
    } catch (error) {
      // Emit back an error to the sender if the message couldn't be saved
      socket.emit('messageSaveError', { message: 'Failed to save message.' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User with ID: ${socket.user_id} disconnected`);
    onlineUsers.delete(socket.user_id);
    setUserOnlineStatus(socket.user_id, false).catch((error) => {
      console.error(error);
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
