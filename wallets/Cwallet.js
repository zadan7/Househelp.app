import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { db } from '../pages/firebase';
import { Cmenu } from '../component/Menu';
import { Header2 } from '../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Cwallet = ({ navigation }) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [clientId, setClientId] = useState(null);

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
  const [currentTxRef, setCurrentTxRef] = useState('');

  // POINT THIS TO YOUR RESTRUCTURING BACKEND ADDRESS
const BACKEND_API_URL = "https://househelp-app-h28t.vercel.app";

  useEffect(() => {
    const initializeWallet = async () => {
      try {
        const storedClient = await AsyncStorage.getItem('clientdata');
       const storedClientId = JSON.parse(storedClient)?.id;
        console.log("Stored Client ID fetched:", storedClientId);
        if (!storedClientId) {
          Alert.alert("Error", "User session not found. Please re-login.");
          setLoading(false);
          return;
        }
        setClientId(storedClientId);

        // Real-time wallet balance listener
        db.collection('wallets').doc(storedClientId).onSnapshot((docSnap) => {
          if (docSnap.exists) {
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

  // --- CONNECTS TO SERVER TO INITIALIZE TRANSACTION ---
  const handleAddMoney = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid amount.");
      return;
    }

    setActiveModal(null);
    setProcessing(true);

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/payments/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parsedAmount,
          clientId: clientId,
          customerEmail: "client@househelp.ng"
        })
      });

      const result = await response.json();

      if (result.success && result.redirectUrl) {
        setCurrentTxRef(result.txRef);
        setCheckoutUrl(result.redirectUrl);
        setShowWebView(true);
      } else {
        Alert.alert("Error", "Could not verify connection config context parameters.");
      }
    } catch (error) {
      Alert.alert("Gateway Error", "Failed to reach backend routing service.");
    } finally {
      setProcessing(false);
    }
  };

  // --- CONNECTS TO SERVER TO VERIFY STATUS ---
  const verifyWebPayment = async (txRef) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/payments/verify/${txRef}`);
      const result = await response.json();

      if (result.success && result.data?.paymentStatus === 'PAID') {
        const exactAmount = result.data.amount;

        // Atomically update ledger metrics values locally (Dot Notation Syntax)
        await db.collection('wallets').doc(clientId).update({
          balance: balance + exactAmount
        });

        await db.collection('transactions').add({
          userId: clientId,
          type: 'Inflow',
          title: 'Wallet Funded',
          amount: exactAmount,
          date: new Date().toISOString(),
          reference: txRef
        });

        Alert.alert("Success", `₦${exactAmount.toLocaleString()} credited successfully.`);
      } else {
        Alert.alert("Payment Verification Pending", "We could not verify this transaction status.");
      }
    } catch (error) {
      Alert.alert("Verification Error", "Could not establish server validation handshakes.");
    } finally {
      setAmount('');
      setLoading(false);
    }
  };

  const handleWebViewStateChange = (navState) => {
    if (navState.url.includes('/completed') || navState.url.includes('monnify.com/respond')) {
      setShowWebView(false);
      setCheckoutUrl(null);
      verifyWebPayment(currentTxRef);
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
        balance: balance - parsedAmount
      });

      await db.collection('transactions').add({
        userId: clientId,
        type: 'Outflow',
        title: 'Bank Withdrawal',
        amount: parsedAmount,
        date: new Date().toISOString(),
        details: `To account: ${accountNumber} (${bankCode})`
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

  // --- FEATURE 3: SEND MONEY ---
  const handleSendMoney = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount > balance || parsedAmount <= 0) {
      Alert.alert("Error", "Invalid amount or insufficient wallet balance.");
      return;
    }

    setProcessing(true);
    try {
      const userSnapshot = await db.collection('users').where('email', '==', recipientEmail.trim().toLowerCase()).get();
      
      if (userSnapshot.empty) {
        Alert.alert("Not Found", "No Househelp account registered with this email.");
        setProcessing(false);
        return;
      }

      const recipientDoc = userSnapshot.docs[0];
      const recipientId = recipientDoc.id;

      if (recipientId === clientId) {
        Alert.alert("Error", "You cannot send money to your own account.");
        setProcessing(false);
        return;
      }

      await db.collection('wallets').doc(clientId).update({ balance: balance - parsedAmount });
      
      const recipientWalletRef = db.collection('wallets').doc(recipientId);
      const recipientWalletDoc = await recipientWalletRef.get();
      const currentRecipientBalance = recipientWalletDoc.exists ? (recipientWalletDoc.data().balance || 0) : 0;
      await recipientWalletRef.set({ balance: currentRecipientBalance + parsedAmount }, { merge: true });

      await db.collection('transactions').add({
        userId: clientId,
        type: 'Outflow',
        title: 'Sent Money',
        amount: parsedAmount,
        date: new Date().toISOString(),
        details: `To: ${recipientEmail}`
      });

      await db.collection('transactions').add({
        userId: recipientId,
        type: 'Inflow',
        title: 'Received Money',
        amount: parsedAmount,
        date: new Date().toISOString(),
        details: `From account holder`
      });

      Alert.alert("Transfer Successful", `₦${parsedAmount.toLocaleString()} sent to ${recipientEmail}`);
      setActiveModal(null);
      setAmount('');
      setRecipientEmail('');
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to execute payment transfer.");
    } finally {
      setProcessing(false);
    }
  };

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

          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#007bff' }]} onPress={() => setActiveModal('send')}>
            <Text style={styles.actionBtnText}>✈ Send Money</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.historyHeading}>Recent Statements</Text>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transaction records found.</Text>
        ) : (
          transactions.map(item => (
            <View key={item.id} style={styles.txCard}>
              <View>
                <Text style={styles.txTitle}>{item.title}</Text>
                <Text style={styles.txDate}>{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                {item.details && <Text style={styles.txDetails}>{item.details}</Text>}
              </View>
              <Text style={[styles.txAmount, { color: item.type === 'Inflow' ? '#28a745' : '#dc3545' }]}>
                {item.type === 'Inflow' ? '+' : '-'} ₦{item.amount.toLocaleString()}
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
          <View style={{ height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Secure Web Checkout</Text>
            <TouchableOpacity onPress={() => { setShowWebView(false); setCheckoutUrl(null); verifyWebPayment(currentTxRef); }}>
              <Text style={{ color: '#dc3545', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
          {checkoutUrl && (
            <WebView 
              source={{ uri: checkoutUrl }} 
              onNavigationStateChange={handleWebViewStateChange}
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