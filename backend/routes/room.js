const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/authToken');
const {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomDetails
} = require('../controllers/room');

router.post('/create', auth, createRoom);
router.post('/join/:roomCode', auth, joinRoom);
router.post('/leave/:roomCode', auth, leaveRoom);
router.get('/room/:roomCode', auth, getRoomDetails);

module.exports = router;
