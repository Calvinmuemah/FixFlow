const { Server } = require('socket.io');
const Chat = require('./models/chat');
const Room = require('./models/room');

// Store connected users: { socketId: { roomCode, user } }
const connectedUsers = {};

// Helper to get current participants in a room
const getParticipantsInRoom = (roomCode) => {
  return Object.values(connectedUsers)
    .filter((u) => u.roomCode === roomCode)
    .map((u) => u.user);
};

module.exports = (server) => {
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  console.log('✅ Socket.IO server initialized');

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // ───── JOIN ROOM ─────
    socket.on('join-room', async ({ roomCode, user }) => {
      if (!roomCode || !user) {
        console.log(`⚠️ Invalid join-room attempt: roomCode=${roomCode}, user=${user}`);
        return;
      }

      socket.join(roomCode);
      connectedUsers[socket.id] = { roomCode, user };
      console.log(`👤 ${user.name} joined ${roomCode}`);

      const room = await Room.findOne({ roomCode });
      const historicalMessages = await Chat.find({ roomCode }).sort({ createdAt: 1 }).limit(100);

      const currentParticipants = getParticipantsInRoom(roomCode);

      io.to(roomCode).emit('room-data', {
        hostId: room?.host?.toString() || null,
        participants: currentParticipants,
        chatHistory: historicalMessages.map((msg) => ({
          user: msg.user,
          message: msg.message,
          timestamp: msg.timestamp,
        })),
      });

      console.log(`➡️ Sent room data to ${roomCode} after ${user.name} joined.`);
    });

    // ───── CHAT MESSAGE ─────
    socket.on('send-message', async ({ roomCode, message, user, timestamp }) => {
      if (!roomCode || !message || !user || !timestamp) {
        console.log(`⚠️ Invalid send-message: ${roomCode}, ${message}, ${user}, ${timestamp}`);
        return;
      }

      const simpleUser = { id: user.id, name: user.name };

      try {
        await Chat.create({ roomCode, user: simpleUser, message, timestamp });

        io.to(roomCode).emit('receive-message', {
          user: simpleUser,
          message,
          timestamp,
        });

        console.log(`💬 ${simpleUser.name} @${roomCode}: ${message}`);
      } catch (err) {
        console.error('❌ Error saving chat:', err.message);
      }
    });

    // ───── DISCONNECT ─────
    socket.on('disconnect', async () => {
      const info = connectedUsers[socket.id];
      if (info) {
        const { roomCode, user } = info;
        console.log(`🚪 ${user.name} leaving ${roomCode}`);
        delete connectedUsers[socket.id];

        const room = await Room.findOne({ roomCode });

        const currentParticipants = getParticipantsInRoom(roomCode);

        io.to(roomCode).emit('room-data', {
          hostId: room?.host?.toString() || null,
          participants: currentParticipants,
          chatHistory: [], // no need to resend chat on disconnect
        });

        console.log(`➡️ Updated participants in ${roomCode} after ${user.name} left.`);
      }

      console.log('❌ Socket disconnected:', socket.id);
    });
  });
};
