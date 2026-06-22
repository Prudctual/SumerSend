import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToWhatsApp } from './whatsapp.js';
import { 
  loadUsers, 
  getUserByEmail, 
  getUserById, 
  addUser 
} from './db.js';

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

    const userId = 'usr_' + Math.random().toString(36).substring(2, 15);
    const passwordHash = bcrypt.hashSync(password, 10);

    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      passwordHash,
      name,
      createdAt: new Date().toISOString()
    };

    await addUser(newUser);
    
    // Note: Database trigger automatically populates defaults (SMTP config, wallet balance, security config, etc.)
    // Initialize WhatsApp socket connection for the new user
    connectToWhatsApp(userId);

    // Generate JWT token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

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

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

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

// Auth middleware to secure routing
export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized access. No session token provided.' });
  }

  const token = authHeader.split(' ')[1];
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
