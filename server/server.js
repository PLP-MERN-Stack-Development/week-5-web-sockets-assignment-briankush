// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users and messages
const users = {};
const rooms = {
  'general': {
    name: 'General',
    description: 'General discussion for everyone',
    messages: [],
    participants: []
  },
  'tech': {
    name: 'Tech Talk',
    description: 'Discuss the latest technology trends',
    messages: [],
    participants: []
  },
  'random': {
    name: 'Random',
    description: 'Random topics and casual chat',
    messages: [],
    participants: []
  }
};
const typingUsers = {};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send list of available rooms to the new connection
  socket.emit('room_list', Object.keys(rooms).map(id => ({
    id,
    name: rooms[id].name,
    description: rooms[id].description,
    participants: rooms[id].participants.length
  })));

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id, currentRoom: null };
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
    console.log(`${username} joined the chat`);
  });

  // Handle joining a room
  socket.on('join_room', ({ roomId, username }) => {
    // Leave current room if in one
    if (users[socket.id] && users[socket.id].currentRoom) {
      const currentRoomId = users[socket.id].currentRoom;
      socket.leave(currentRoomId);
      
      // Remove from participants list of previous room
      if (rooms[currentRoomId]) {
        rooms[currentRoomId].participants = rooms[currentRoomId].participants.filter(id => id !== socket.id);
        
        // Notify room that user left
        io.to(currentRoomId).emit('user_left_room', {
          username,
          roomId: currentRoomId
        });
        
        // Update room list for all users
        io.emit('room_update', {
          id: currentRoomId,
          participants: rooms[currentRoomId].participants.length
        });
      }
    }
    
    // Join new room
    if (rooms[roomId]) {
      socket.join(roomId);
      users[socket.id].currentRoom = roomId;
      
      // Add to participants list
      if (!rooms[roomId].participants.includes(socket.id)) {
        rooms[roomId].participants.push(socket.id);
      }
      
      // Send room history to the user
      socket.emit('room_history', {
        roomId,
        messages: rooms[roomId].messages
      });
      
      // Notify room that user joined
      socket.to(roomId).emit('user_joined_room', {
        username,
        roomId
      });
      
      // Update room list for all users
      io.emit('room_update', {
        id: roomId,
        participants: rooms[roomId].participants.length
      });
      
      console.log(`${username} joined room: ${roomId}`);
    }
  });

  // Create a new room
  socket.on('create_room', ({ name, description }) => {
    const roomId = name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if room already exists
    if (rooms[roomId]) {
      socket.emit('room_error', {
        message: 'A room with this name already exists'
      });
      return;
    }
    
    // Create the room
    rooms[roomId] = {
      name,
      description,
      messages: [],
      participants: []
    };
    
    // Notify all users about the new room
    io.emit('new_room', {
      id: roomId,
      name,
      description,
      participants: 0
    });
    
    console.log(`New room created: ${name}`);
  });

  // Handle chat messages in rooms
  socket.on('send_message', (messageData) => {
    const { roomId, message } = messageData;
    
    if (!users[socket.id] || !rooms[roomId]) {
      return;
    }
    
    const formattedMessage = {
      id: Date.now(),
      sender: users[socket.id].username,
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      roomId
    };
    
    // Store message in room history
    rooms[roomId].messages.push(formattedMessage);
    
    // Limit stored messages to prevent memory issues
    if (rooms[roomId].messages.length > 100) {
      rooms[roomId].messages.shift();
    }
    
    // Send to all users in the room
    io.to(roomId).emit('receive_message', formattedMessage);
  });

  // Handle typing indicator
  socket.on('typing', ({ roomId, isTyping }) => {
    if (!users[socket.id] || !rooms[roomId]) {
      return;
    }
    
    const username = users[socket.id].username;
    
    if (!typingUsers[roomId]) {
      typingUsers[roomId] = {};
    }
    
    if (isTyping) {
      typingUsers[roomId][socket.id] = username;
    } else {
      delete typingUsers[roomId][socket.id];
    }
    
    // Broadcast to room only
    socket.to(roomId).emit('typing_users', {
      roomId,
      users: Object.values(typingUsers[roomId] || {})
    });
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };
    
    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username, currentRoom } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
      
      // Remove from room if in one
      if (currentRoom && rooms[currentRoom]) {
        rooms[currentRoom].participants = rooms[currentRoom].participants.filter(id => id !== socket.id);
        
        // Update room list for all users
        io.emit('room_update', {
          id: currentRoom,
          participants: rooms[currentRoom].participants.length
        });
      }
    }
    
    delete users[socket.id];
    
    // Remove from typing indicators in all rooms
    Object.keys(typingUsers).forEach(roomId => {
      if (typingUsers[roomId] && typingUsers[roomId][socket.id]) {
        delete typingUsers[roomId][socket.id];
        io.to(roomId).emit('typing_users', {
          roomId,
          users: Object.values(typingUsers[roomId] || {})
        });
      }
    });
    
    io.emit('user_list', Object.values(users));
  });
});

// API routes
app.get('/api/rooms', (req, res) => {
  const roomList = Object.keys(rooms).map(id => ({
    id,
    name: rooms[id].name,
    description: rooms[id].description,
    participants: rooms[id].participants.length
  }));
  res.json(roomList);
});

app.get('/api/messages/:roomId', (req, res) => {
  const { roomId } = req.params;
  if (rooms[roomId]) {
    res.json(rooms[roomId].messages);
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };