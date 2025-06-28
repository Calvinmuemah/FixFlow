require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');

const connectDB = require('./config/db');
connectDB();

const { errorHandler } = require('./middlewares/error');
const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/room', require('./routes/room'));

//berror handler
app.use(errorHandler);

// Replace app.listen() with a raw HTTP server
const server = http.createServer(app);

// 🔌 Attach Socket.IO
require('./socket')(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Express + Socket.IO server running on port ${PORT}`)
);
