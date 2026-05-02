import admin from 'firebase-admin';
import express from 'express';
import cors from 'cors'; // <--- 1. Add this (run npm install cors)

const app = express();

// 2. Add CORS middleware - This is why your app gets 404/405 but curl works
app.use(cors()); 
app.use(express.json()); // Built-in alternative to bodyParser

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

// Simple in-memory storage (Note: This resets every time Vercel goes idle)
const fcmTokens = {}; 

app.post('/registerFCMToken', (req, res) => {
  const { userId, fcmToken, platform } = req.body;
  if (!userId || !fcmToken) {
    return res.status(400).json({ message: 'userId and fcmToken are required.' });
  }
  fcmTokens[userId] = fcmToken;
  res.status(200).json({ message: 'FCM Token registered successfully.' });
});

// Main Notification Route
app.post('/sendNotificationToUser', async (req, res) => {
  // Destructure exactly what your React Native app is sending
  const { userId, title, body, token } = req.body;
  const targetFCMToken = token; 

  if (!targetFCMToken) {
    return res.status(400).json({ message: `No FCM token provided.` });
  }

  const result = await sendTestNotification(targetFCMToken, title, body, userId);

  if (result.success) {
    res.status(200).json({ message: 'Notification sent!', messageId: result.messageId });
  } else {
    res.status(500).json({ message: 'Failed to send notification.', error: result.error });
  }
});

async function sendTestNotification(targetFCMToken, title, body, userId) {
  const message = {
    notification: { title, body },
    data: { screen: 'details', userId: userId || '' },
    token: targetFCMToken,
    android: { priority: 'high' },
    apns: { payload: { aps: { contentAvailable: true } } },
  };

  try {
    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// VERY IMPORTANT FOR VERCEL
export default app;