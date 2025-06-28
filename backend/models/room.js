const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true,
  },

  roomName: {
    type: String,
    default: function () {
      return `Room ${this.roomCode}`;
    },
  },

  isPrivate: {
    type: Boolean,
    default: false,
  },

  roomPassword: {
    type: String,
    required: function () {
      return this.isPrivate;
    },
  },

  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },

  lastUpdatedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Room', roomSchema);
