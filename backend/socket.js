const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./config/logger');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    }
  });

  // Socket.IO authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      logger.warn({ socketId: socket.id }, 'Socket connection without token');
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      logger.info({ userId: decoded.id, socketId: socket.id }, 'Socket authenticated');
      next();
    } catch (err) {
      logger.error({ err, socketId: socket.id }, 'Socket authentication failed');
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info({ 
      userId: socket.userId, 
      socketId: socket.id 
    }, 'User connected via Socket.IO');

    // Join user-specific room
    socket.join(`user-${socket.userId}`);

    socket.on('disconnect', () => {
      logger.info({ 
        userId: socket.userId, 
        socketId: socket.id 
      }, 'User disconnected from Socket.IO');
    });

    // Handle custom events
    socket.on('ping', (callback) => {
      callback({ status: 'ok', timestamp: Date.now() });
    });
  });

  logger.info('Socket.IO initialized successfully');
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Emit events to specific user
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
    logger.debug({ userId, event, data }, 'Event emitted to user');
  }
};

// Emit events to all connected clients
const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
    logger.debug({ event, data }, 'Event emitted to all users');
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToAll
};
