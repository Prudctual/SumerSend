import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  connectToWhatsApp,
  getWhatsAppStatus,
  sendWhatsAppMessage,
  logoutWhatsApp,
  initializeAllWhatsAppConnections
} from './whatsapp.js';

dotenv.config();

if (!process.env.WHATSAPP_SERVICE_SECRET) {
  console.warn('⚠️ WARNING: WHATSAPP_SERVICE_SECRET is not configured. Falling back to default secret.');
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Middleware to verify shared service token for security hardening
const serviceAuthMiddleware = (req, res, next) => {
  if (req.path === '/health') {
    return next();
  }

  const authHeader = req.headers.authorization;
  const serviceSecret = process.env.WHATSAPP_SERVICE_SECRET || 'sumer_send_whatsapp_service_secret_key_98765';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header.' });
  }

  const token = authHeader.split(' ')[1];
  if (token !== serviceSecret) {
    return res.status(401).json({ error: 'Unauthorized: Service secret token mismatch.' });
  }

  next();
};

app.use(serviceAuthMiddleware);

// GET /status/:userId -> Returns WhatsApp connection status and QR code
app.get('/status/:userId', (req, res) => {
  try {
    const status = getWhatsAppStatus(req.params.userId);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /send -> Send WhatsApp message
app.post('/send', async (req, res) => {
  const { userId, to, body } = req.body;
  if (!userId || !to || !body) {
    return res.status(400).json({ error: 'userId, to, and body are required.' });
  }
  try {
    const result = await sendWhatsAppMessage(userId, to, body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /logout -> Logout user WhatsApp session
app.post('/logout', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required.' });
  }
  try {
    await logoutWhatsApp(userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /initialize -> Start WhatsApp connection for a specific user
app.post('/initialize', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required.' });
  }
  try {
    await connectToWhatsApp(userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /initialize-all -> Initialize connections for all registered users
app.post('/initialize-all', async (req, res) => {
  try {
    await initializeAllWhatsAppConnections();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'whatsapp-service', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[WhatsApp Service] Server running on port ${PORT}`);
  initializeAllWhatsAppConnections();
});
