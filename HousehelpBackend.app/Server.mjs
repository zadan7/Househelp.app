// --- This code runs on your backend server ---

import admin from 'firebase-admin';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000; // Or whatever port your backend runs on

// Initialize the Admin SDK
// Replace './path/to/your-service-account-file.json' with your actual path
// It's crucial to load this securely, e.g., from an environment variable
// import serviceAccount from './househelporg.json' with { type: 'json' };
const serviceAccount = {
  "type": "service_account",
  "project_id": "househelporg-7c2cd",
  "private_key_id": "e9fe8bec627ef3adff8cd026c8273499c6877e5a",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC+372hbclOxiBs\nIvPCifHWNENThGyaLyjeXzAarc+cQgGnhBgtLS54Cp43r11H8rchXi4rJorCKL1A\nUvL0tYnheCbK53HDG+OAC2juGmwJKH+QGkCaJMMKbevBpomnQIphMRf27bkvactS\nt7dHu/B+jwrxk0hxZ7k6AKLefpIcewjj5/i6Tm2XTYSA+73PJ850aBP2Tiy7u//P\nEhfGr00/66Du6bd1h8YduA1lFFOdOzGdi0cjuUSBmcC21rCGuBT5evWylasouxI6\nkUsTTSRnhL4GyyQrF9CmmCH35fusNlR/MkTjsQNth782PrknyiLzlkkLuJBFweLk\nJGouUz4xAgMBAAECggEADm+Ee3t+oJcKZ7NDBUECicU9HEllH0oWyK6hSDtB+trh\nHia231/N5mVDLwnzv5fDMuJZEolhMCr9mSpM1qYOLf+0y16ys2NeEtaKEovsBMtL\nzn21yhKir5y9mlE6kuwmKxCX8+Rpv4S8TF65nVLA7wlpdfjCH1WNZC4dIz+mVEH2\nXYYZ+mIoWgU6uW95GD71S0y4aadfkep9YgsXT/RMcaYSEMLlXgDn64YuH8TI2DmB\n76o/w2d+TXI1T/DqHlXmITPzZdny6nHMKswlBeOyDSQKmpREiJU0m7zoC5x5lnva\noAzEMlnhKEhJzjo6LXL1IiSXPxF0LM3HhvdJDeNJuQKBgQDqRUbk+E8+WaFA5VxV\npCcCsryIV0rl6O/s7zb80uqYx76oBVVOiZV3kd+M6z8FV/bOch7aWcnmKfB7zQTe\nuFX56s7shQoIHs6yZ2J0/qtGw3SKoa59ZcvfagVcHhlLTOKUV7DBr1Agwi+9KFPz\nHuFpoxTii1MJUFPtdrokWneQxQKBgQDQlARY3YtzuAANce50Zcb/jCkerGANm1k3\nSRe/w1DIgxlIaNHkSpRwJdVEIFRiE99GhWm3kbOS33j9UdRmIVTILkBeGYNvyEQY\nT769mNfk4VcngmdbPcGkLb/L5JFBj5IV8ugZ6U1cjayNsARRr39AbIob6WOuWpZO\nOc0g6kg2fQKBgQCjSRwL1eLt020onXUJIDwsjkYIRcenjf9Exsst1xi62mZSGD2I\nWy85wwvs3b70S4Z0CGjmyjSGX28F6zVcw2Dxq68Efgoq9MYe5R5j62mYDf257s1/\nC6fZFb2cokIBERrQSHqj1TzlSFQb5PL2fuygQ5H4ASIkWL/WwK0nT4MM/QKBgCVD\nDDPEAHG/4WKFhBAPTqnApGfya4aCxkF2MWP0xK3NneqtrzGVkUcnux3cmLaczjqP\nAv/ka6xFeBvpToSgV8EbYixtamnB4UhmlrDQaWFeUG+igExwj/OAqM8IGlsYBwUc\nzBI097kdJkJ5u4vMSnN78IBkBYbUcB2xfc/vis8RAoGARR4zWLN3JE2suhfUXxeU\nWOiqlRCX/rhss43qt8bhGupE4fZjXGaDYr9F20TSOgltiQwf2+DFYHzgojCqmCUu\nfuvnEQNi1ZM8gxfNNjCSEdH3K4o27uyw+83bAGPtCyTOInN5rfiLqp0f/uEBtpn2\nsX6RaVc+ZXoH1D+uX/9wyHw=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@househelporg-7c2cd.iam.gserviceaccount.com",
  "client_id": "114403033756088264235",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40househelporg-7c2cd.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(bodyParser.json()); // Middleware to parse JSON request bodies

// In a real app, you'd store these tokens in a database
const fcmTokens = {}; // Simple in-memory storage for demonstration

app.post('/registerFCMToken', (req, res) => {
  const { userId, fcmToken, platform } = req.body;

  if (!userId || !fcmToken) {
    return res.status(400).json({ message: 'userId and fcmToken are required.' });
  }

  fcmTokens[userId] = fcmToken; // Store the token (in a real app, save to DB)
  console.log(`Registered FCM Token for user ${userId} (${platform}): ${fcmToken}`);

  sendTestNotification(fcmToken); // Optionally send a test notification immediately
  res.status(200).json({ message: 'FCM Token registered successfully.' });
});


// Notification Sending Logic
async function sendTestNotification(targetFCMToken) {
  if (!targetFCMToken) {
    console.error('No FCM token provided to send notification.');
    return;
  }

  const message = {
    notification: {
      title: 'Hello from Firebase Admin!',
      body: 'This is a test notification sent from your backend.',
    },
    data: {
      screen: 'details', // Example: data your app can use to navigate
      itemId: '12345',
      messageType: 'test_notification',
    },
    token: targetFCMToken,
    apns: {
      payload: {
        aps: {
          contentAvailable: true, // For background data messages on iOS
        },
      },
      headers: {
        'apns-push-type': 'background', // For background data messages on iOS
        'apns-priority': '5', // Background priority
      },
    },
    android: {
      priority: 'high', // For high priority data messages on Android
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }
}

// Example of how you might trigger this (e.g., via another API endpoint):
app.post('/sendNotificationToUser', async (req, res) => {
  const { userId, title, body,token } = req.body;
  const targetFCMToken = token; // Get token from your storage

  if (!targetFCMToken) {
    return res.status(404).json({ message: `No FCM token found for user ${userId}.` });
  }

  const result = await sendTestNotification(targetFCMToken, title, body);

  if (result.success) {
    res.status(200).json({ message: 'Notification sent!', messageId: result.messageId });
  } else {
    res.status(500).json({ message: 'Failed to send notification.', error: result.error });
  }
});


// app.listen(port, () => {
//   console.log(`Backend server listening at http://localhost:${port}`);
// });

// You could also call sendTestNotification directly from a script for quick testing:
// (async () => {
//   const testUserId = 'some-user-id'; // Use a user ID that has registered a token
//   // Make sure the token is registered first by running the app and hitting /registerFCMToken
//   // You might need to add a delay or some other mechanism to ensure fcmTokens[testUserId] is populated
//   setTimeout(async () => {
//     const storedToken = fcmTokens[testUserId];
//     if (storedToken) {
//       console.log(`Attempting to send direct test notification to ${storedToken}`);
//       await sendTestNotification(storedToken);
//     } else {
//       console.warn(`No token for ${testUserId} in in-memory storage. Please run app first and register token.`);
//     }
//   }, 5000); // Wait 5 seconds for token registration for this example
// })();

export default app; // Export the function for use in other modules if needed