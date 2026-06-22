import { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadUsers } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve data paths dynamically for Vercel's read-only file system
const DATA_DIR = process.env.VERCEL 
  ? path.join('/tmp', 'data') 
  : path.join(__dirname, 'data');

const sockets = {};
const qrs = {};
const connections = {};

// Logger
const logger = pino({ level: 'silent' });

export async function connectToWhatsApp(userId) {
    if (!userId) return null;
    console.log(`Starting connectToWhatsApp for user ${userId}...`);
    
    try {
        if (sockets[userId]) {
            try { 
                sockets[userId].ev.removeAllListeners(); 
                sockets[userId].end(); 
            } catch (e) {
                console.error(`Error ending old socket for user ${userId}:`, e);
            }
        }
        
        const userDir = path.join(DATA_DIR, 'users', userId);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        const authPath = path.join(userDir, 'baileys_auth_info');
        
        const { state, saveCreds } = await useMultiFileAuthState(authPath);
        console.log(`useMultiFileAuthState loaded for user ${userId}`);
        
        const sock = makeWASocket({
            auth: state,
            logger,
            printQRInTerminal: false, // We will handle QR via API
            browser: Browsers.macOS('Desktop')
        });

        sockets[userId] = sock;

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                qrs[userId] = await QRCode.toDataURL(qr);
                connections[userId] = false;
            }

            if (connection === 'close') {
                connections[userId] = false;
                qrs[userId] = null;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const isLoggedOut = statusCode === DisconnectReason.loggedOut;
                console.log(`WhatsApp connection closed for ${userId} due to `, lastDisconnect?.error, `, isLoggedOut: ${isLoggedOut}`);
                
                // Cleanup old socket events if possible
                try {
                    sock?.ev?.removeAllListeners('connection.update');
                    sock?.ev?.removeAllListeners('creds.update');
                } catch (e) {}

                if (isLoggedOut) {
                    console.log(`WhatsApp logged out for ${userId}. Deleting credentials and generating new QR...`);
                    try {
                        fs.rmSync(authPath, { recursive: true, force: true });
                    } catch (e) {
                        console.error(`Error removing auth info for ${userId}:`, e);
                    }
                }
                
                // Always schedule a reconnect attempt
                console.log(`Scheduling reconnect for user ${userId} in 3 seconds...`);
                setTimeout(() => connectToWhatsApp(userId), 3000);
            } else if (connection === 'open') {
                connections[userId] = true;
                qrs[userId] = null;
                console.log(`WhatsApp connection opened for user ${userId}!`);
            }
        });

        return sock;
    } catch (err) {
        console.error(`Error in connectToWhatsApp for user ${userId}:`, err);
        // Schedule a retry to handle file locking or temporary load issues
        console.log(`Scheduling retry to connect WhatsApp for user ${userId} in 10 seconds...`);
        setTimeout(() => connectToWhatsApp(userId), 10000);
        return null;
    }
}

export function getWhatsAppStatus(userId) {
    if (!userId) return { connected: false, qr: null };
    if (!sockets[userId]) {
        console.log(`Auto-initializing WhatsApp connection for user ${userId} on status check...`);
        connectToWhatsApp(userId);
    }
    return {
        connected: !!connections[userId],
        qr: qrs[userId] || null
    };
}

export async function sendWhatsAppMessage(userId, to, body) {
    if (!userId) throw new Error('User ID is required for WhatsApp dispatch.');
    const sock = sockets[userId];
    const isConnected = connections[userId];
    
    if (!sock || !isConnected) {
        throw new Error('WhatsApp is not connected.');
    }
    
    // Format the phone number correctly for WhatsApp API (e.g., add country code if needed, and @s.whatsapp.net)
    let jid = to;
    if (jid.startsWith('0')) {
        jid = '964' + jid.substring(1);
    }
    if (!jid.includes('@')) {
        jid = jid + '@s.whatsapp.net';
    }

    try {
        const result = await sock.sendMessage(jid, { text: body });
        return result;
    } catch (error) {
        console.error(`Failed to send WhatsApp message for user ${userId}:`, error);
        throw error;
    }
}

export async function logoutWhatsApp(userId) {
    if (!userId) return;
    const sock = sockets[userId];
    if (sock) {
        try {
            await sock.logout();
        } catch (e) {}
    }
    connections[userId] = false;
    qrs[userId] = null;
    
    const userDir = path.join(DATA_DIR, 'users', userId);
    const authPath = path.join(userDir, 'baileys_auth_info');
    
    try {
        fs.rmSync(authPath, { recursive: true, force: true });
    } catch (e) {
        console.error(`Error removing auth info on logout for ${userId}:`, e);
    }
    // Reinitialize to get a new QR code
    connectToWhatsApp(userId);
}

// Helper to initialize sockets for all registered users on startup
export async function initializeAllWhatsAppConnections() {
    try {
        const users = await loadUsers();
        if (Array.isArray(users) && users.length > 0) {
            console.log(`Found ${users.length} users in database, initializing WhatsApp sockets...`);
            for (const user of users) {
                if (user.id) {
                    connectToWhatsApp(user.id);
                }
            }
        }
    } catch (e) {
        console.error('Failed to initialize WhatsApp connections from database:', e);
    }
}
