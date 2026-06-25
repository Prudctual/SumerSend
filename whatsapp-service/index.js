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

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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
