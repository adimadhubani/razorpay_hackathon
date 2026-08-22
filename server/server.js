import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with permissive CORS for development
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store socket instance in app
app.set('socketio', io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1', apiRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'Razorpay IntentGuard — AI Agent Payment Firewall',
    timestamp: new Date().toISOString()
  });
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  
  socket.emit('system_status', {
    status: 'SHIELD_ACTIVE',
    mode: 'REAL_TIME_GUARD',
    timestamp: new Date().toISOString()
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5001;

// Start Server & DB Connection
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`
===============================================================
 🛡️  RAZORPAY INTENTGUARD — AI AGENT PAYMENT FIREWALL READY
 📡  Server listening on http://localhost:${PORT}
 ⚡  Socket.io Telemetry active on ws://localhost:${PORT}
===============================================================
    `);
  });
};

startServer();
