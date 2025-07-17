const { Server } = require('socket.io');
const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');
const { verifyToken } = require('../utils/jwt');

// Store active connections
const onlineUsers = new Map();

// Track users who are typing
const typingUsers = new Map();

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Authentication error: Invalid token'));
    }
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }
    
    // Attach user to socket
    socket.user = {
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
    };
    
    next();
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    
    // Add user to online users map
    onlineUsers.set(userId, socket.id);
    
    // Update user status in database
    await User.findByIdAndUpdate(userId, { status: 'online' });
    
    // Broadcast updated user list
    io.emit('userStatusUpdate', { userId, status: 'online' });
    
    console.log(`User connected: ${socket.user.username}`);

    // Join a chat room
    socket.on('joinRoom', async ({ roomId }) => {
      // Leave all other rooms (except socket's default room)
      const socketRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
      socketRooms.forEach(room => socket.leave(room));
      
      // Join the new room
      socket.join(roomId);
      
      // Fetch recent messages for the room
      const messages = await Message.find({ room: roomId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('sender', 'username avatar')
        .lean();
      
      socket.emit('roomHistory', { roomId, messages: messages.reverse() });
      
      // Notify room that user has joined
      socket.to(roomId).emit('userJoined', {
        user: socket.user,
        roomId,
        message: `${socket.user.username} has joined the room`,
      });
    });

    // Send a message
    socket.on('sendMessage', async (data) => {
      const { roomId, content } = data;
      
      try {
        // Create and save the message
        const message = await Message.create({
          sender: userId,
          content,
          room: roomId,
          readBy: [userId],  // Mark as read by sender
        });
        
        // Populate sender info
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username avatar')
          .lean();
        
        // Send message to all users in the room
        io.to(roomId).emit('newMessage', populatedMessage);
      } catch (error) {
        console.error('Message error:', error);
        socket.emit('errorMessage', { message: 'Failed to send message' });
      }
    });

    // User is typing
    socket.on('typing', ({ roomId }) => {
      // Add user to typing map for this room
      if (!typingUsers.has(roomId)) {
        typingUsers.set(roomId, new Set());
      }
      typingUsers.get(roomId).add(socket.user.username);
      
      // Broadcast to room that user is typing
      socket.to(roomId).emit('userTyping', {
        user: socket.user.username,
        usersTyping: Array.from(typingUsers.get(roomId)),
      });
      
      // Remove user from typing after a delay (if they stop typing)
      setTimeout(() => {
        if (typingUsers.has(roomId)) {
          typingUsers.get(roomId).delete(socket.user.username);
          socket.to(roomId).emit('userTyping', {
            user: socket.user.username,
            usersTyping: Array.from(typingUsers.get(roomId) || []),
          });
        }
      }, 3000);
    });

    // Mark messages as read
    socket.on('markRead', async ({ roomId, messageId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { readBy: userId },
        });
        
        socket.to(roomId).emit('messageRead', { messageId, userId });
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.username}`);
      
      // Remove user from online users map
      onlineUsers.delete(userId);
      
      // Update user status in database
      await User.findByIdAndUpdate(userId, { status: 'offline' });
      
      // Broadcast updated user list
      io.emit('userStatusUpdate', { userId, status: 'offline' });
      
      // Remove user from all typing maps
      for (const [roomId, users] of typingUsers.entries()) {
        if (users.has(socket.user.username)) {
          users.delete(socket.user.username);
          socket.to(roomId).emit('userTyping', {
            user: socket.user.username,
            usersTyping: Array.from(users),
          });
        }
      }
    });
  });

  return io;
};

module.exports = setupSocket;
