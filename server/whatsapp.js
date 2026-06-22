import { makeWASocket, DisconnectReason, Browsers } from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import { loadUsers, supabase } from './db.js';
import { useSupabaseAuthState } from './wa_db_auth.js';

const sockets = {};
const qrs = {};
const connections = {};

// Logger (silent to avoid terminal clutter unless debugging)
const logger = pino({ level: 'silent' });

export async function connectToWhatsApp(userId) {
    if (!userId) return null;
    console.log(`Starting connectToWhatsApp for user ${userId} using Supabase Auth State...`);
    
    try {
        if (sockets[userId]) {
            try { 
                sockets[userId].ev.removeAllListeners(); 
                sockets[userId].end(); 
            } catch (e) {
                console.error(`Error ending old socket for user ${userId}:`, e);
            }
        }
        
        const { state, saveCreds } = await useSupabaseAuthState(userId);
        console.log(`useSupabaseAuthState loaded for user ${userId}`);
        
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
                
                // Cleanup old socket events
                try {
                    sock?.ev?.removeAllListeners('connection.update');
                    sock?.ev?.removeAllListeners('creds.update');
                } catch (e) {}

                if (isLoggedOut) {
                    console.log(`WhatsApp logged out for ${userId}. Deleting database credentials and generating new QR...`);
                    try {
                        const { error } = await supabase
                            .from('whatsapp_sessions')
                            .delete()
                            .eq('user_id', userId);
                        if (error) console.error(`Error deleting sessions on logout for ${userId}:`, error);
                    } catch (e) {
                        console.error(`Error removing database auth info for ${userId}:`, e);
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
        // Schedule a retry to handle temporary network issues
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
    
    // Format the phone number correctly for WhatsApp API
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
    
    try {
        const { error } = await supabase
            .from('whatsapp_sessions')
            .delete()
            .eq('user_id', userId);
        if (error) console.error(`Error deleting sessions on logoutWhatsApp for ${userId}:`, error);
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

