import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import firebase from 'firebase/app'; // Required for FieldValue increment tracking
import { db } from '../pages/firebase';
import { Cmenu } from '../component/Menu';
import { Header2 } from '../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const initializeWallet = async () => {
      try {
        const storedClient = await AsyncStorage.getItem('clientdata');
        setClientData(JSON.parse(storedClient));
        const storedClientId =  JSON.parse(storedClient).id 
        if (!storedClientId) {
          Alert.alert("Error", "User session not found. Please re-login.");
          setLoading(false);
          return;
        }
        setClientId(storedClientId);

        // Real-time wallet balance listener with data existence safeguards
        db.collection('wallets').doc(storedClientId).onSnapshot((docSnap) => {
          if (docSnap.exists && docSnap.data()) {
            setBalance(docSnap.data().balance || 0);
          } else {
            db.collection('wallets').doc(storedClientId).set({ balance: 0 });
            setBalance(0);
          }
        });

        // Real-time transaction records listener
        db.collection('transactions')
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
          balance: firebase.firestore.FieldValue.increment(creditAmount)
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
        balance: firebase.firestore.FieldValue.increment(-parsedAmount)
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

  //     await db.collection('wallets').doc(clientId).update({ balance: firebase.firestore.FieldValue.increment(-parsedAmount) });
      
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={{ marginTop: 10 }}>Syncing Secure Ledger...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header2 />
      <Cmenu navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Client Wallet</Text>

        <View style={styles.balanceCard}>
           <Text style={styles.balanceLabel}>{(clientData?.firstname + ' ' + clientData?.lastname).toUpperCase()}</Text>
           <Text style={styles.balanceLabel}></Text>

          <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
          <Text style={styles.balanceAmount}>₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#28a745' }]} onPress={() => setActiveModal('fund')}>
            <Text style={styles.actionBtnText}>+ Add Money</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#dc3545' }]} onPress={() => setActiveModal('withdraw')}>
            <Text style={styles.actionBtnText}>⤻ Withdraw</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#007bff' }]} onPress={() => setActiveModal('send')}>
            <Text style={styles.actionBtnText}>✈ Send Money</Text>
          </TouchableOpacity> */}
        </View>

        <Text style={styles.historyHeading}>Recent Statements</Text>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transaction records found.</Text>
        ) : (
          transactions.map(item => (
            <View key={item.id} style={styles.txCard}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.txTitle}>{item.title}</Text>
                <Text style={styles.txDate}>
                  {item.date ? `${new Date(item.date).toLocaleDateString()} ${new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'N/A'}
                </Text>
                {item.details && <Text style={styles.txDetails}>{item.details}</Text>}
              </View>
              <Text style={[styles.txAmount, { color: item.type === 'Inflow' ? '#28a745' : '#dc3545' }]}>
                {item.type === 'Inflow' ? '+' : '-'} ₦{item.amount ? item.amount.toLocaleString() : 0}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* --- REUSABLE OPERATIONAL FORMS MODALS --- */}
      <Modal visible={activeModal !== null} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>
              {activeModal === 'fund' && 'Fund Wallet'}
              {activeModal === 'withdraw' && 'Withdraw Funds'}
              {activeModal === 'send' && 'Send Money Directly'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Amount (₦)"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            {activeModal === 'withdraw' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="10-Digit Account Number"
                  keyboardType="numeric"
                  maxLength={10}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Bank Name (e.g., GTBank)"
                  value={bankCode}
                  onChangeText={setBankCode}
                />
              </>
            )}

            {activeModal === 'send' && (
              <TextInput
                style={styles.input}
                placeholder="Recipient Account Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={recipientEmail}
                onChangeText={setRecipientEmail}
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => { setActiveModal(null); setAmount(''); setRecipientEmail(''); setAccountNumber(''); setBankCode(''); }}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalBtn, styles.confirmBtn]} 
                onPress={() => {
                  if (activeModal === 'fund') handleAddMoney();
                  if (activeModal === 'withdraw') handleWithdrawMoney();
                  if (activeModal === 'send') handleSendMoney();
                }}
                disabled={processing}
              >
                {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- WEB CHECKOUT WEBVIEW WINDOW CONTAINER --- */}
      <Modal visible={showWebView} animationType="fade" onRequestClose={() => { setShowWebView(false); setCheckoutUrl(null); }}>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{ height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingTop: 10 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Secure Monnify Checkout</Text>
            <TouchableOpacity onPress={() => { setShowWebView(false); setCheckoutUrl(null); }}>
              <Text style={{ color: '#dc3545', fontWeight: 'bold' }}>Close</Text>
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
              renderLoading={() => <ActivityIndicator size="large" color="#28a745" style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -20, marginTop: -20 }} />}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { paddingBottom: 30 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 15, color: '#343a40' },
  balanceCard: { backgroundColor: '#212529', padding: 25, borderRadius: 15, marginHorizontal: 20, marginVertical: 10, elevation: 4 },
  balanceLabel: { color: '#adb5bd', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  balanceAmount: { color: '#ffffff', fontSize: 30, fontWeight: 'bold', marginTop: 5 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 15 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 4, elevation: 1 },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  historyHeading: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, marginTop: 25, marginBottom: 10, color: '#495057' },
  emptyText: { textAlign: 'center', color: '#6c757d', marginTop: 20, fontSize: 15 },
  txCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginHorizontal: 20, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  txTitle: { fontSize: 15, fontWeight: '600', color: '#212529' },
  txDate: { fontSize: 12, color: '#868e96', marginTop: 2 },
  txDetails: { fontSize: 12, color: '#6c757d', fontStyle: 'italic', marginTop: 1 },
  txAmount: { fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '85%', padding: 20, borderRadius: 12, elevation: 5 },
  modalHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#212529', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ced4da', padding: 12, borderRadius: 6, marginBottom: 12, fontSize: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 6, alignItems: 'center', marginHorizontal: 5 },
  cancelBtn: { backgroundColor: '#6c757d' },
  confirmBtn: { backgroundColor: '#28a745' },
  modalBtnText: { color: '#fff', fontWeight: 'bold' }
});

export { Cwallet };