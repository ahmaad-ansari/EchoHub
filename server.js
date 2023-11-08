require('dotenv').config(); // Ensure this is at the top to load environment variables
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Setup Socket.IO

// Middleware to parse the body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const userRoutes = require('./routes/users'); // Make sure the path is correct based on your project structure
const friendRoutes = require('./routes/friends');
app.use('/users', userRoutes);
app.use('/friends', friendRoutes);


// Test API Endpoint
app.get('/', (req, res) => {
  res.send('EchoHub Server is running!');
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
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
