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
async function getMonnifyAccessToken() {
  const tokenCredentials = Buffer.from(`${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`).toString('base64');
  const response = await axios.post(`${MONNIFY_BASE_URL}/api/v1/auth/login`, {}, {
    headers: { 'Authorization': `Basic ${tokenCredentials}` }
  });
  return response.data.responseBody.accessToken;
}

// --- ENDPOINT: INITIALIZE MONNIFY TRANSACTION ---
app.post('/api/payments/init', async (req, res) => {
  try {
    const { amount, clientId, customerEmail } = req.body;
    
    if (!amount || !clientId) {
      return res.status(400).json({ success: false, message: 'amount and clientId are required.' });
    }

    const token = await getMonnifyAccessToken();
    const txRef = `FUND-${clientId}-${Date.now()}`;

    const response = await axios.post(`${MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`, {
      amount: parseFloat(amount),
      customerName: "Househelp Client",
      customerEmail: customerEmail || "client@househelp.ng",
      paymentReference: txRef,
      paymentDescription: "Funding Househelp Digital Wallet",
      currencyCode: "NGN",
      contractCode: MONNIFY_CONTRACT_CODE,
      // redirectUrl: "https://localhost/completed"
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    res.status(200).json({ 
      success: true, 
      txRef, 
      redirectUrl: response.data.responseBody.redirectUrl 
    });
  } catch (error) {
    console.error("Monnify init error:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- ENDPOINT: VERIFY MONNIFY TRANSACTION TRANSACTION ---
app.get('/api/payments/verify/:txRef', async (req, res) => {
  try {
    const { txRef } = req.params;
    const token = await getMonnifyAccessToken();

    const response = await axios.get(`${MONNIFY_BASE_URL}/api/v1/merchant/transactions/query?paymentReference=${txRef}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    res.status(200).json({ 
      success: true, 
      data: response.data.responseBody 
    });
  } catch (error) {
    console.error("Monnify verify error:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


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

export default app;