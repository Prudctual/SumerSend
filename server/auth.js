import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { connectToWhatsApp } from './whatsapp.js';
import { 
  loadUsers, 
  getUserByEmail, 
  getUserById, 
  addUser,
  saveApiKeys
} from './db.js';

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error("FATAL ERROR: JWT_SECRET environment variable is not defined in production!");
    process.exit(1);
  } else {
    console.warn("⚠️ WARNING: JWT_SECRET is not defined. Using insecure development fallback key.");
  }
}
const JWT_SECRET = process.env.JWT_SECRET || 'sumer-send-default-jwt-secret-key-12345';

const authRouter = express.Router();

// Register API
authRouter.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields (email, password, name) are required.' });
  }

  try {
    const exists = await getUserByEmail(email);

    if (exists) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const userId = 'usr_' + crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      passwordHash,
      name,
      createdAt: new Date().toISOString()
    };

    await addUser(newUser);

    // Generate initial secure API key
    const randomHex = crypto.randomBytes(32).toString('hex');
    const generatedKey = `sm_live_${randomHex}`;
    const hashedKey = crypto.createHash('sha256').update(generatedKey).digest('hex');
    const maskedKey = `sm_live_${generatedKey.slice(8, 12)}...${generatedKey.slice(-6)}`;
    const storedKeyValue = `${hashedKey}:${maskedKey}`;

    const newKey = {
      id: userId + '_key_1',
      name: 'Main Application Key',
      key: storedKeyValue,
      scope: 'full',
      createdAt: new Date().toISOString()
    };

    await saveApiKeys(userId, [newKey]);
    
    // Note: Database trigger automatically populates defaults (SMTP config, wallet balance, security config, etc.)
    // Initialize WhatsApp socket connection for the new user
    connectToWhatsApp(userId);

    // Generate JWT token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    // Set HTTP-Only Cookie
    res.cookie('sumer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      token,
      user: {
        id: userId,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'An error occurred during registration. Please try again.' });
  }
});

// Login API
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await getUserByEmail(email);

    const isPasswordValid = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Set HTTP-Only Cookie
    res.cookie('sumer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An error occurred during login. Please try again.' });
  }
});

// Logout API
authRouter.post('/logout', (req, res) => {
  res.clearCookie('sumer_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Auth middleware to secure routing
export async function authMiddleware(req, res, next) {
  // Prioritize Authorization Header first, then fall back to Cookie
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    const cookieToken = req.headers.cookie
      ? req.headers.cookie.match(/(?:^|;)\s*sumer_token\s*=\s*([^;]+)/)?.[1]
      : null;
    token = cookieToken;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized access. No session token provided.' });
  }

  // Build fallback authHeader if needed
  if (!authHeader) {
    authHeader = `Bearer ${token}`;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or token invalid.' });
  }
}

// Get Current User Profile API
authRouter.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export { authRouter };
