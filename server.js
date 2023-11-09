require('dotenv').config();
const cors = require('cors');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const pool = require('./db/index'); // Make sure this path is correct for your project
const { saveMessage } = require('./services/messageService'); // Adjust the path as necessary
const { setUserOnlineStatus } = require('./services/userService'); // Adjust the path as necessary
const winston = require('winston'); // Ensure you have installed winston
const messageService = require('./services/messageService');

// Configure winston for logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => `[${info.timestamp}] [${info.level.toUpperCase()}] ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' })
  ]
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

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

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const messageRoutes = require('./routes/messages'); // Make sure the path is correct
const userRoutes = require('./routes/users'); // Make sure the path is correct
const friendRoutes = require('./routes/friends'); // Make sure the path is correct
app.use('/users', userRoutes);
app.use('/friends', friendRoutes);
app.use('/messages', messageRoutes);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error'));
      }
      socket.user_id = decoded.user_id;
      next();
    });
  } else {
    next(new Error('Authentication error'));
  }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  logger.info(`New client connected, user_id: ${socket.user_id}`);
  onlineUsers.set(socket.user_id, socket);

  setUserOnlineStatus(socket.user_id, true).catch((error) => {
    logger.error(`Error setting user online status: ${error}`);
  });

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

app.get('/', (req, res) => {
  res.send('EchoHub Server is running!');
});

app.use((error, req, res, next) => {
  logger.error(`Unhandled exception: ${error.stack}`);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
