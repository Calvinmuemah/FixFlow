const Room = require('../models/room');
const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');

/* ───────── CREATE ───────── */
exports.createRoom = async (req, res) => {
  try {
    const roomCode = nanoid(6);
    const { roomName, isPrivate = false, password } = req.body;

    let hashedPassword = null;
    if (isPrivate) {
      if (!password) {
        return res.status(400).json({ error: 'Password required for private room' });
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const room = await Room.create({
      roomCode,
      roomName: roomName?.trim() || undefined,
      isPrivate,
      roomPassword: hashedPassword,
      host: req.user._id,
      participants: [req.user._id],
    });

    res.status(201).json({
      roomCode: room.roomCode,
      roomName: room.roomName,
      isPrivate: room.isPrivate,
      host: room.host,
    });
  } catch (err) {
    console.error('❌ Room creation error:', err.message);
    res.status(500).json({ error: 'Room creation failed' });
  }
};

/* ───────── JOIN ───────── */
exports.joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { password } = req.body;

    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.isPrivate) {
      if (!password) return res.status(401).json({ message: 'Password required' });

      const match = await bcrypt.compare(password, room.roomPassword);
      if (!match) return res.status(403).json({ message: 'Incorrect password' });
    }

    if (!room.participants.includes(req.user._id)) {
      room.participants.push(req.user._id);
      await room.save();
    }

    res.json({
      roomCode: room.roomCode,
      roomName: room.roomName,
      isPrivate: room.isPrivate,
      host: room.host,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Join room failed' });
  }
};

/* ───────── LEAVE ───────── */
exports.leaveRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.participants = room.participants.filter(
      (p) => p.toString() !== req.user._id.toString()
    );

    if (
      room.participants.length === 0 ||
      room.host.toString() === req.user._id.toString()
    ) {
      await Room.deleteOne({ _id: room._id });
      return res.json({ message: 'Room destroyed' });
    }

    await room.save();
    res.json({ message: 'Left room' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Leave room failed' });
  }
};

/* ───────── GET ROOM DETAILS ───────── */
exports.getRoomDetails = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({ roomCode }).select('-roomPassword');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({
      roomCode: room.roomCode,
      roomName: room.roomName,
      isPrivate: room.isPrivate,
      host: room.host,
      participants: room.participants,
      createdAt: room.createdAt,
    });
  } catch (err) {
    console.error('❌ Get room details error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve room details' });
  }
};
