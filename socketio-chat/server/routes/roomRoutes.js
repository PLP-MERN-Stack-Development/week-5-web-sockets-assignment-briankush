const express = require('express');
const Room = require('../models/Room');
const { verifyToken } = require('../utils/jwt');

const router = express.Router();

// Auth middleware
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
    
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Get all rooms
router.get('/', protect, async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('createdBy', 'username')
      .lean();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new room
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    
    const roomExists = await Room.findOne({ name });
    if (roomExists) {
      return res.status(400).json({ message: 'Room already exists' });
    }
    
    const room = await Room.create({
      name,
      description,
      isPrivate,
      participants: [req.userId],
      createdBy: req.userId,
    });
    
    const populatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'username')
      .lean();
    
    res.status(201).json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
