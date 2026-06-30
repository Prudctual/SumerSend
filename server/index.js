import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { 
  initializeAllWhatsAppConnections 
} from './whatsapp.js';
import { authRouter, authMiddleware } from './auth.js';
import { startQueueWorker } from './worker.js';
import { apiRouter } from './routes/api.js';
import { v1Router } from './routes/v1.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://sumersend.com'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// API Rate Limiting for Public /v1/ Endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});
app.use('/v1/', apiLimiter);

// Auth endpoints rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

// Dashboard API Rate Limiting (for logged in users)
const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Allow up to 1000 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many dashboard requests. Please try again later.'
  }
});

// ----------------------------------------------------
// Public Authentication Routes
// ----------------------------------------------------
app.use('/api/auth', authLimiter, authRouter);

// Health check (public)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    region: 'Baghdad (Iraq)',
    timestamp: new Date().toISOString()
  });
});

// ----------------------------------------------------
// Secure Dashboard APIs (Require Session JWT)
// ----------------------------------------------------
app.use('/api', dashboardLimiter, (req, res, next) => {
  if (req.path.startsWith('/auth') || req.path.startsWith('/public') || req.path === '/health' || req.path === '/wallet/topup/webhook') {
    return next();
  }
  return authMiddleware(req, res, next);
});

// Mount modular routers
app.use('/api', apiRouter);
app.use('/v1', v1Router);

// Start server and initialize all sockets if not running on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Sumer Send Server running on port ${PORT}`);
    initializeAllWhatsAppConnections();
    startQueueWorker();

    // Keep-alive / Self-ping routine to prevent Render containers from idling/sleeping
    const selfPingUrl = process.env.RENDER_EXTERNAL_URL || `http://127.0.0.1:${PORT}`;
    console.log(`Keep-alive self-pinging configured for: ${selfPingUrl}`);
    setInterval(async () => {
      try {
        const res = await fetch(`${selfPingUrl}/health`);
        console.log(`[Keep-Alive] Pinged health endpoint: ${res.status} ${res.statusText}`);
      } catch (err) {
        console.warn(`[Keep-Alive] Ping failed:`, err.message);
      }
    }, 10 * 60 * 1000); // every 10 minutes (Render timeout is 15 minutes)
  });
}

export default app;
