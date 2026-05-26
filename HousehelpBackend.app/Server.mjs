import admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import axios from 'axios'; // For server-to-server HTTP calls

const app = express();

app.use(cors()); 
app.use(express.json());

// Initialize the Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.project_id,
      clientEmail: process.env.client_email,
      privateKey: process.env.private_key?.replace(/\\n/g, '\n'),
    }),
  });
}

// Monnify Configuration Credentials (Move these to your Vercel Environment Variables in production!)
const MONNIFY_BASE_URL = "https://sandbox.monnify.com";
const MONNIFY_API_KEY = "MK_TEST_TJDXJAS0YD";
const MONNIFY_SECRET_KEY =  "JWBN0NAKE8TM537U891LLUX5R45PR33W";
const MONNIFY_CONTRACT_CODE =  "5732437028";

// --- HELPER: MONNIFY AUTHENTICATION HANDSHAKE ---


// --- NOTIFICATION UTILITIES ---
const fcmTokens = {}; 

app.post('/registerFCMToken', (req, res) => {
  const { userId, fcmToken, platform } = req.body;
  if (!userId || !fcmToken) {
    return res.status(400).json({ message: 'userId and fcmToken are required.' });
  }
  fcmTokens[userId] = fcmToken;
  res.status(200).json({ message: 'FCM Token registered successfully.' });
});

app.post('/sendNotificationToUser', async (req, res) => {
  const { userId, title, body, token,jobid } = req.body;
  const targetFCMToken = token; 

  if (!targetFCMToken) {
    return res.status(400).json({ message: `No FCM token provided.` });
  }

  const result = await sendTestNotification(targetFCMToken, title, body, userId, jobid);

  if (result.success) {
    res.status(200).json({ message: 'Notification sent!', messageId: result.messageId });
  } else {
    res.status(500).json({ message: 'Failed to send notification.', error: result.error });
  }
});

async function sendTestNotification(targetFCMToken, title, body, userId, jobid) {
  const message = {
    // 1. Visible system tray configuration
    notification: { 
      title, 
      body 
    },
    
    // 2. Custom app data parameters for client-side navigation routing
    data: { 
      screen: 'hpartime', 
      userId: String(userId || ''), 
      jobid: String(jobid || '')
    },
    
    token: targetFCMToken,
    
    // 3. Android Platform Specific Settings (Correctly Nested)
    android: { 
      priority: 'HIGH', 
      notification: {
        sound: 'default',
        clickAction: 'FLUTTER_NOTIFICATION_CLICK', 
      }
    },
    
    // 4. Apple iOS Push Settings
    apns: { 
      payload: { 
        aps: { 
          contentAvailable: true, 
          sound: 'default'
        } 
      } 
    },
  };

  try {
    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error("FCM Delivery Engine Failure:", error);
    return { success: false, error: error.message };
  }
}

export default app;