const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
