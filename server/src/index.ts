import 'dotenv/config';

console.log('Starting server...');
console.log('Environment Variables:', JSON.stringify(process.env, null, 2));

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';

import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import ticketRoutes from './routes/tickets';
import bidRoutes from './routes/bids';
import adminRoutes from './routes/admin';
import passwordResetRoutes from './routes/passwordReset';
import { authenticateToken } from './middleware/auth';
import { generateAndSendQRCodes } from './services/qrCodeService';
import { processExpiredBids } from './services/bidService';
import { prisma } from './config/database';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

if (!process.env.PORT) {
  throw new Error('PORT env not set!');
}
const PORT = process.env.PORT;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://ticketreselling.vercel.app',
    'https://ticketreselling-d1mb24cys-stanish28s-projects.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true
}));
app.use(morgan('combined'));
// Temporarily disable rate limiting for development
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
}
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/password-reset', passwordResetRoutes);

// Health check
app.get('/health', (req, res) => {
  console.log('Health check requested'); // Add this line
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-bid-room', (ticketId: string) => {
    socket.join(`ticket-${ticketId}`);
    console.log(`User joined bid room for ticket: ${ticketId}`);
  });

  socket.on('leave-bid-room', (ticketId: string) => {
    socket.leave(`ticket-${ticketId}`);
    console.log(`User left bid room for ticket: ${ticketId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Cron jobs
// Check for events 24 hours before and generate QR codes
cron.schedule('0 */6 * * *', async () => {
  try {
    await generateAndSendQRCodes();
    console.log('QR code generation job completed');
  } catch (error) {
    console.error('QR code generation job failed:', error);
  }
});

// Process expired bids every hour
cron.schedule('0 * * * *', async () => {
  try {
    await processExpiredBids(io);
    console.log('Expired bids processing completed');
  } catch (error) {
    console.error('Expired bids processing failed:', error);
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
console.log("PORT ENV:", process.env.PORT, "PORT VAR:", PORT);
server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
});


setInterval(() => {
  console.log("Server is alive...");
}, 30000);

export { io }; 