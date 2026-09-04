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

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

// Initialize Socket.io with permissive CORS for development
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin or matching dev origins or any localhost
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly fallback
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store socket instance in app
app.set('socketio', io);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(null, true); // Dev-friendly fallback
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
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
