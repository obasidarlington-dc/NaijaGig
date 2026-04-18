const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const prisma = require('./prisma/client');

const app = express();
const server = http.createServer(app);

// Socket.io setup with authentication middleware
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket authentication middleware (single version)
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: no token'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error: invalid token'));
  }
});

// ─────────────────────────────────────────
// Admin backend routes (separate router for admin panel)
// ─────────────────────────────────────────
app.use('/api/admin', require('./src/routes/admin'));


// ─────────────────────────────────────────
// upload routes (for profile images and job proof photos)
// ─────────────────────────────────────────
app.use('/api/upload', require('./src/routes/upload'));

// ─────────────────────────────────────────
// Express Middleware
// ─────────────────────────────────────────
app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────
// Basic Routes
// ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🚀 ArtisanConnect API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      artisans: '/api/artisans',
      bookings: '/api/bookings',
      messages: '/api/messages',
      reviews: '/api/reviews',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/artisan', require('./src/routes/artisan'));
app.use('/api/chat', require('./src/routes/chat'));
app.use('/api/client', require('./src/routes/client'));
app.use('/api/withdrawal', require('./src/routes/withdrawal'));

// ─────────────────────────────────────────
// Socket.io Real-time Chat
// ─────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id, 'userId:', socket.userId);

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined room: ${conversationId}`);
  });

  socket.on('send_message', async (data) => {
    const { conversationId, content } = data;
    const senderId = socket.userId;
    if (!senderId || !conversationId || !content) return;

    try {
      // Save message to database
      const newMessage = await prisma.message.create({
        data: {
          conversationId,
          senderId,
          content,
        },
        include: { sender: { select: { name: true, profileImage: true } } },
      });
      // Update conversation's updatedAt timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
      // Broadcast to all participants in the room
      io.to(conversationId).emit('new_message', newMessage);
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  });

  socket.on('mark_read', async (data) => {
    const { conversationId, userId } = data;
    try {
      await prisma.message.updateMany({
        where: { conversationId, senderId: { not: userId }, isRead: false },
        data: { isRead: true },
      });
      io.to(conversationId).emit('messages_read', { conversationId, userId });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// ─────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
});

// ─────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`🔗 Network: http://10.191.121.196:${PORT}`);
});

module.exports = { app, server, io };