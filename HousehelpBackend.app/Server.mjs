// --- This code runs on your backend server ---

import admin from 'firebase-admin';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000; // Or whatever port your backend runs on

// Initialize the Admin SDK
// Replace './path/to/your-service-account-file.json' with yoAur actual path
// It's crucial to load this securely, e.g., from an environment variable
// import serviceAccount from './househelporg.json' with { type: 'json' };

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // This line fixes the "Invalid JWT" error by handling the newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
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