import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore'; // FieldValue increment (native SDK, matches db in pages/firebase)
import { db } from '../pages/firebase';
import { Cmenu } from '../component/Menu';
import { Header2 } from '../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Field, Button } from '../component/ui';
import { colors, space, radius, type, shadow } from '../component/theme';

const Cwallet = ({ navigation }) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [clientData, setClientData] = useState(null);

  // Modal Controls
  const [activeModal, setActiveModal] = useState(null);
  const [amount, setAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  // Web Checkout Flow States
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [showWebView, setShowWebView] = useState(false);
  

  // Sandbox Monnify Public Facing Credentials
  const MONNIFY_API_KEY = "MK_TEST_TJDXJAS0YD";
  const MONNIFY_CONTRACT_CODE = "5732437028";

  useEffect(() => {
    let unsubWallet = () => {};
    let unsubTx = () => {};
    const initializeWallet = async () => {
      try {
        const storedClient = await AsyncStorage.getItem('clientdata');
        const parsedClient = storedClient ? JSON.parse(storedClient) : null;
        setClientData(parsedClient);
        const storedClientId = parsedClient && parsedClient.id;
        if (!storedClientId) {
          Alert.alert("Error", "User session not found. Please re-login.");
          setLoading(false);
          return;
        }
        setClientId(storedClientId);

        // Real-time wallet balance listener with data existence safeguards
        unsubWallet = db.collection('wallets').doc(storedClientId).onSnapshot((docSnap) => {
          if (docSnap.exists && docSnap.data()) {
            setBalance(docSnap.data().balance || 0);
          } else {
            db.collection('wallets').doc(storedClientId).set({ balance: 0 });
            setBalance(0);
          }
        });

        // Real-time transaction records listener
        unsubTx = db.collection('transactions')
          .where('userId', '==', storedClientId)
          .onSnapshot((querySnapshot) => {
            const txList = [];
            querySnapshot.forEach((doc) => {
              txList.push({ id: doc.id, ...doc.data() });
            });
            txList.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTransactions(txList);
            setLoading(false);
          }, (err) => {
            console.error("Tx history error:", err);
            setLoading(false);
          });

      } catch (error) {
        console.error("Initialization failed:", error);
        setLoading(false);
      }
    };

    initializeWallet();
    return () => {
      unsubWallet();
      unsubTx();
    };
  }, []);

  // --- 1. GENERATE LOCAL CLIENT-SIDE MONNIFY SDK PAYLOAD ---
  const handleAddMoney = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid amount.");
      return;
    }

    setActiveModal(null);
    const paymentRef = `FUND-${clientId}-${Date.now()}`;
    const customerEmail = "client@househelp.ng"; 

    // Directly building the HTML container string to serve inside the WebView wrapper
    const checkoutHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script type="text/javascript" src="https://sdk.monnify.com/plugin/monnify.js"></script>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8f9fa; font-family: sans-serif; }
            .loader { border: 4px solid #f3f3f3; border-top: 4px solid #28a745; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <script type="text/javascript">
            window.onload = function() {
              try {
                MonnifySDK.initialize({
                  amount: ${parsedAmount},
                  currency: "NGN",
                  reference: "${paymentRef}",
                  customerName: "Househelp Client",
                  customerEmail: "${customerEmail}",
                  apiKey: "${MONNIFY_API_KEY}",
                  contractCode: "${MONNIFY_CONTRACT_CODE}",
                  paymentDescription: "Wallet Deposit",
                  isTestMode: true,
                  onComplete: function(response){
                    window.ReactNativeWebView.postMessage(JSON.stringify({status: 'SUCCESS', data: response, exactAmount: ${parsedAmount}}));
                  },
                  onClose: function(data){
                    window.ReactNativeWebView.postMessage(JSON.stringify({status: 'CANCELLED'}));
                  }
                });
              } catch(e) {
                window.ReactNativeWebView.postMessage(JSON.stringify({status: 'ERROR', message: e.message}));
              }
            }
          </script>
        </body>
      </html>
    `;

    setCheckoutUrl(checkoutHTML);
    setShowWebView(true);
  };

  // --- CLIENT SIDE PAYMENT VERIFICATION PROCESSOR GATEWAY ---
  const handleWebViewMessage = async (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      setShowWebView(false);
      setCheckoutUrl(null);

      if (message.status === 'SUCCESS' && message.data.paymentStatus === 'PAID') {
        const creditAmount = message.exactAmount;
        const txRef = message.data.paymentReference;

        setLoading(true);

        // Atomic update of current balance fields using dots notation safely
        await db.collection('wallets').doc(clientId).update({
          balance: firestore.FieldValue.increment(creditAmount)
        });

        // Build system entry history receipt log trace
        await db.collection('transactions').add({
          userId: clientId,
          type: 'Inflow',
          title: 'Wallet Funded',
          amount: creditAmount,
          date: new Date().toISOString(),
          reference: txRef
        });

        Alert.alert("Success", `₦${creditAmount.toLocaleString()} credited successfully.`);
      } else if (message.status === 'CANCELLED') {
        Alert.alert("Cancelled", "The checkout process was closed by user directive.");
      } else {
        Alert.alert("Payment Error", "The terminal declined or encountered an error processing transaction.");
      }
    } catch (err) {
      console.error("SDK callback failure processing:", err);
      Alert.alert("Process Failure", "An error occurred handling payment collection records.");
    } finally {
      setAmount('');
      setLoading(false);
    }
  };

  // --- FEATURE 2: WITHDRAW MONEY ---
  const handleWithdrawMoney = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount > balance || parsedAmount <= 0) {
      Alert.alert("Error", "Insufficient balance or invalid amount.");
      return;
    }
    if (!accountNumber || accountNumber.length !== 10) {
      Alert.alert("Error", "Please provide a valid 10-digit NUBAN account number.");
      return;
    }

    setProcessing(true);
    try {
      await db.collection('wallets').doc(clientId).update({
        balance: firestore.FieldValue.increment(-parsedAmount)
      });

      await db.collection('transactions').add({
        userId: clientId,
        type: 'Outflow',
        title: 'Bank Withdrawal',
        amount: parsedAmount,
        date: new Date().toISOString(),
        details: `To account: ${accountNumber} (${bankCode})`,
        status: 'PENDING'
      });

      Alert.alert("Withdrawal Initialized", "Your withdrawal request has been logged successfully.");
      setActiveModal(null);
      setAmount('');
      setAccountNumber('');
      setBankCode('');
    } catch (error) {
      Alert.alert("Error", "Failed to process withdrawal action.");
    } finally {
      setProcessing(false);
    }
  };

  // // --- FEATURE 3: SEND MONEY ---
  // const handleSendMoney = async () => {
  //   const parsedAmount = parseFloat(amount);
  //   if (!parsedAmount || parsedAmount > balance || parsedAmount <= 0) {
  //     Alert.alert("Error", "Invalid amount or insufficient wallet balance.");
  //     return;
  //   }

  //   setProcessing(true);
  //   try {
  //     const userSnapshot = await db.collection('users').where('email', '==', recipientEmail.trim().toLowerCase()).get();
      
  //     if (userSnapshot.empty) {
  //       Alert.alert("Not Found", "No Househelp account registered with this email.");
  //       setProcessing(false);
  //       return;
  //     }

  //     const recipientDoc = userSnapshot.docs[0];
  //     const recipientId = recipientDoc.id;

  //     if (recipientId === clientId) {
  //       Alert.alert("Error", "You cannot send money to your own account.");
  //       setProcessing(false);
  //       return;
  //     }

  //     await db.collection('wallets').doc(clientId).update({ balance: firestore.FieldValue.increment(-parsedAmount) });
      
  //     const recipientWalletRef = db.collection('wallets').doc(recipientId);
  //     const recipientWalletDoc = await recipientWalletRef.get();
  //     const currentRecipientBalance = (recipientWalletDoc.exists && recipientWalletDoc.data()) ? (recipientWalletDoc.data().balance || 0) : 0;
  //     await recipientWalletRef.set({ balance: currentRecipientBalance + parsedAmount }, { merge: true });

  //     await db.collection('transactions').add({
  //       userId: clientId,
  //       type: 'Outflow',
  //       title: 'Sent Money',
  //       amount: parsedAmount,
  //       date: new Date().toISOString(),
  //       details: `To: ${recipientEmail}`
  //     });

  //     await db.collection('transactions').add({
  //       userId: recipientId,
  //       type: 'Inflow',
  //       title: 'Received Money',
  //       amount: parsedAmount,
  //       date: new Date().toISOString(),
  //       details: `From account holder`
  //     });

  //     Alert.alert("Transfer Successful", `₦${parsedAmount.toLocaleString()} sent to ${recipientEmail}`);
  //     setActiveModal(null);
  //     setAmount('');
  //     setRecipientEmail('');
  //   } catch (err) {
  //     console.error(err);
  //     Alert.alert("Error", "Failed to execute payment transfer.");
  //   } finally {
  //     setProcessing(false);
  //   }
  // };

  const closeForm = () => { setActiveModal(null); setAmount(''); setRecipientEmail(''); setAccountNumber(''); setBankCode(''); };
  const naira = (n) => `\u20A6${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fullName = clientData ? `${clientData.firstname || ''} ${clientData.lastname || ''}`.trim() : '';

  if (loading) {
    return (
      <View style={styles.root}>
        <Header2 />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Syncing secure ledger...</Text>
        </View>
        <Cmenu navigation={navigation} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Header2 />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          {fullName ? <Text style={styles.balanceName}>{fullName.toUpperCase()}</Text> : null}
          <Text style={styles.balanceLabel}>Available balance</Text>
          <Text style={styles.balanceAmount}>{naira(balance)}</Text>
          <View style={styles.actionRow}>
            <Button title="+ Add Money" variant="secondary" onPress={() => setActiveModal('fund')} style={styles.actionBtn} />
            <TouchableOpacity style={styles.withdrawBtn} onPress={() => setActiveModal('withdraw')} activeOpacity={0.85}>
              <Text style={styles.withdrawText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[type.h2, { marginTop: space.xl, marginBottom: space.md }]}>Recent statements</Text>
        {transactions.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={30} color={colors.muted} />
            <Text style={styles.muted}>No transaction records found.</Text>
          </View>
        ) : (
          transactions.map((item) => {
            const inflow = item.type === 'Inflow';
            return (
              <View key={item.id} style={styles.tx}>
                <View style={[styles.txIcon, { backgroundColor: inflow ? colors.primarySoft : colors.dangerSoft }]}>
                  <Ionicons name={inflow ? 'arrow-down' : 'arrow-up'} size={18} color={inflow ? colors.primary : colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txTitle}>{item.title}</Text>
                  <Text style={styles.txMeta}>
                    {item.date ? `${new Date(item.date).toLocaleDateString()} ${new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                  </Text>
                  {item.details ? <Text style={styles.txMeta}>{item.details}</Text> : null}
                </View>
                <Text style={[styles.txAmount, { color: inflow ? colors.primary : colors.danger }]}>
                  {inflow ? '+' : '-'} {'\u20A6'}{item.amount ? item.amount.toLocaleString() : 0}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* --- OPERATIONAL FORMS MODAL --- */}
      <Modal visible={activeModal !== null} animationType="slide" transparent={true} onRequestClose={closeForm}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheet}>
            <Text style={type.h1}>
              {activeModal === 'fund' && 'Fund wallet'}
              {activeModal === 'withdraw' && 'Withdraw funds'}
              {activeModal === 'send' && 'Send money directly'}
            </Text>
            {activeModal === 'withdraw' ? <Text style={styles.sheetSub}>Available: {naira(balance)}</Text> : null}

            <Field label={'Amount (\u20A6)'} keyboardType="numeric" value={amount} onChangeText={setAmount} />

            {activeModal === 'withdraw' && (
              <>
                <Field label="Account number" placeholder="10-digit account number" keyboardType="numeric" maxLength={10} value={accountNumber} onChangeText={setAccountNumber} />
                <Field label="Bank name" placeholder="e.g. GTBank" value={bankCode} onChangeText={setBankCode} />
              </>
            )}

            {activeModal === 'send' && (
              <Field label="Recipient email" placeholder="Recipient account email" keyboardType="email-address" autoCapitalize="none" value={recipientEmail} onChangeText={setRecipientEmail} />
            )}

            <Button
              title="Confirm"
              loading={processing}
              onPress={() => {
                if (activeModal === 'fund') handleAddMoney();
                if (activeModal === 'withdraw') handleWithdrawMoney();
              }}
            />
            <Button title="Cancel" variant="secondary" onPress={closeForm} disabled={processing} />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- WEB CHECKOUT WEBVIEW WINDOW CONTAINER --- */}
      <Modal visible={showWebView} animationType="fade" onRequestClose={() => { setShowWebView(false); setCheckoutUrl(null); }}>
        <View style={{ flex: 1, backgroundColor: colors.white }}>
          <View style={styles.checkoutBar}>
            <Ionicons name="lock-closed" size={16} color={colors.primary} />
            <Text style={styles.checkoutTitle}>Secure Monnify Checkout</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => { setShowWebView(false); setCheckoutUrl(null); }}>
              <Text style={{ color: colors.danger, fontWeight: '700' }}>Close</Text>
            </TouchableOpacity>
          </View>
          {checkoutUrl && (
            <WebView 
              originWhitelist={['*']}
              source={{ html: checkoutUrl }} 
              onMessage={handleWebViewMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => <ActivityIndicator size="large" color={colors.primary} style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -20, marginTop: -20 }} />}
            />
          )}
        </View>
      </Modal>

      <Cmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 110 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  muted: { color: colors.muted, textAlign: 'center' },
  balanceCard: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: space.xl, ...shadow },
  balanceName: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: space.sm },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  balanceAmount: { color: colors.white, fontSize: 34, fontWeight: '800', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: space.md, marginTop: space.lg },
  actionBtn: { flex: 1 },
  withdrawBtn: { flex: 1, minHeight: 54, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
  withdrawText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  empty: { alignItems: 'center', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, gap: space.sm },
  tx: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.white, borderRadius: radius.md, padding: space.md, marginBottom: space.sm, ...shadow },
  txIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  txTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  txMeta: { fontSize: 12, color: colors.muted, marginTop: 1 },
  txAmount: { fontSize: 14, fontWeight: '800' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(8,20,14,0.5)' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: space.xl, gap: space.md },
  sheetSub: { color: colors.muted, marginTop: -space.sm },
  checkoutBar: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  checkoutTitle: { flex: 1, fontWeight: '700', fontSize: 16, color: colors.text },
  closeBtn: { minHeight: 48, justifyContent: 'center', paddingHorizontal: space.sm },
});

export { Cwallet };