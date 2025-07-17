const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const setupSocket = require('./socket/socket');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
require('dotenv').config();

// Connect to database
connectDB();

// Initialize express app
const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
setupSocket(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
});
