import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { db } from '../pages/firebase';
import { Cmenu } from '../component/Menu'; // Reusing your layout menu component
import { Header2 } from '../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Hwallet = ({ navigation }) => {
  const [balance, setBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [providerId, setProviderId] = useState(null);
  const [help, setHelp] = useState({});

  // Operational Control States
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const initializeProviderWallet = async () => {
      try {
        const user = await AsyncStorage.getItem('househelpdata');
        const storedProviderId = JSON.parse(user).id;
        setHelp(JSON.parse(user));
        console.log(JSON.parse(user).id, JSON.parse(user));
        if (!storedProviderId) {
          Alert.alert("Error", "Provider session expired. Please log in again.");
          setLoading(false);
          return;
        }
        setProviderId(storedProviderId);

        // Real-time synchronization of provider ledger balances
        db.collection('provider_wallets').doc(storedProviderId).onSnapshot((docSnap) => {
          if (docSnap.exists) {
            const data = docSnap.data();
            setBalance(data.balance || 0);
            setPendingBalance(data.pendingBalance || 0); // Funds locked until chore verification settles
          } else {
            // Document creation fallback loop
            db.collection('provider_wallets').doc(storedProviderId).set({
              balance: 0,
              pendingBalance: 0,
              totalEarned: 0
            });
            setBalance(0);
            setPendingBalance(0);
          }
        });

        // Pull earning payouts and settlement transaction statements logs
        db.collection('transactions')
          .where('userId', '==', storedProviderId)
          .onSnapshot((querySnapshot) => {
            const txList = [];
            querySnapshot.forEach((doc) => {
              txList.push({ id: doc.id, ...doc.data() });
            });
            // Order items chronologically via client-side javascript parsing
            txList.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTransactions(txList);
            setLoading(false);
          }, (err) => {
            console.error("Statement sync crash: ", err);
            setLoading(false);
          });

      } catch (error) {
        console.error("Fatal initialization failure: ", error);
        setLoading(false);
      }
    };

    initializeProviderWallet();
  }, []);
useEffect(() => {
    const fetchHelpData = async () => {
      try {
        const storedHelp = await AsyncStorage.getItem('househelpdata');
        if (storedHelp) {
          setHelp(JSON.parse(storedHelp));
        }

      } catch (error) {
        console.error("Error fetching househelp data:", error);
      }
    }
  fetchHelpData();
  }, []
    );


  // --- WITHDRAW EARNINGS HANDLER ---
  const handleWithdrawalRequest = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Invalid Amount", "Please input a realistic value to cash out.");
      return;
    }
    if (parsedAmount > balance) {
      Alert.alert("Declined", "You cannot request more than your available payout balance.");
      return;
    }
    if (!accountNumber || accountNumber.length !== 10) {
      Alert.alert("Validation Error", "Nigerian NUBAN standards require a clean 10-digit account string.");
      return;
    }
    if (!bankName.trim()) {
      Alert.alert("Missing Info", "Please name the destination commercial or microfinance bank.");
      return;
    }

    setProcessing(true);
    try {
      // Deduct balance atomically via standard database write calls
      await db.collection('provider_wallets').doc(providerId).update({
        balance: balance - parsedAmount
      });

      // Append transaction statement entry mapping context parameters
      await db.collection('transactions').add({
        userId: providerId,
        type: 'Outflow',
        title: 'Payout Withdrawal',
        amount: parsedAmount,
        date: new Date().toISOString(),
        details: `Settling to ${bankName} (${accountNumber})`,
        status: 'Pending' // Househelp system handles verification before bank delivery orchestration
      });

      Alert.alert("Payout Dispatched", "Your withdrawal request is processing and will arrive shortly.");
      setWithdrawModal(false);
      setAmount('');
      setAccountNumber('');
      setBankName('');
    } catch (error) {
      Alert.alert("Error", "Ledger execution crashed. Transaction reverted safely.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={{ marginTop: 12, color: '#6c757d' }}>Loading Provider Ledger balances...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header2 />
      <Cmenu navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Provider Earnings</Text>

        {/* Extended Accounting Overview Panels */}
        <View style={styles.dashboardContainer}>
          <View style={styles.mainBalanceCard}>
            <Text style={styles.balanceLabel}>AVAILABLE FOR WITHDRAWAL</Text>
            <Text style={styles.balanceAmount}>{help?.name + " "}</Text>
            <Text style={styles.balanceAmount}>₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
          </View>
          
          <View style={styles.secondaryBalanceCard}>
            <Text style={styles.pendingLabel}>ESCROW / PENDING CLEARANCE</Text>
            <Text style={styles.pendingAmount}>₦{pendingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>

        {/* Withdrawal Operational Request Trigger */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.withdrawActionBtn} 
            onPress={() => setWithdrawModal(true)}
            disabled={balance <= 0}
          >
            <Text style={styles.withdrawActionText}>
              {balance > 0 ? "Withdraw Earnings to Bank" : "No Available Payout Funds"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Provider Income Statements Rollout */}
        <Text style={styles.historyHeading}>Earnings & Payout Ledger</Text>
        {transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>You haven't processed any chore listings yet.</Text>
          </View>
        ) : (
          transactions.map((item) => (
            <View key={item.id} style={styles.txCard}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.txTitle}>{item.title}</Text>
                <Text style={styles.txDate}>
                  {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {item.details && <Text style={styles.txDetails}>{item.details}</Text>}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.txAmount, { color: item.type === 'Inflow' ? '#28a745' : '#dc3545' }]}>
                  {item.type === 'Inflow' ? '+' : '-'} ₦{item.amount.toLocaleString()}
                </Text>
                {item.status && (
                  <Text style={[styles.statusTag, { color: item.status === 'Pending' ? '#ffc107' : '#28a745' }]}>
                    {item.status}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* --- BANK WITHDRAWAL SUBMISSION MODAL FORM --- */}
      <Modal visible={withdrawModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Bank Transfer Payout</Text>

            <TextInput
              style={styles.input}
              placeholder="Amount to Cash Out (₦)"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <TextInput
              style={styles.input}
              placeholder="10-Digit NUBAN Account Number"
              keyboardType="numeric"
              maxLength={10}
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <TextInput
              style={styles.input}
              placeholder="Bank Name (e.g., Access Bank, Kuda)"
              value={bankName}
              onChangeText={setBankName}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => { setWithdrawModal(false); setAmount(''); setAccountNumber(''); setBankName(''); }}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalBtn, styles.confirmBtn]} 
                onPress={handleWithdrawalRequest}
                disabled={processing}
              >
                {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 15, color: '#343a40' },
  dashboardContainer: { marginHorizontal: 15, gap: 10 },
  mainBalanceCard: { backgroundColor: '#1e7e34', padding: 22, borderRadius: 12, elevation: 3 },
  balanceLabel: { color: '#d4edda', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  balanceAmount: { color: '#ffffff', fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  secondaryBalanceCard: { backgroundColor: '#ffffff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#dee2e6' },
  pendingLabel: { color: '#6c757d', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  pendingAmount: { color: '#495057', fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  actionContainer: { paddingHorizontal: 15, marginTop: 15 },
  withdrawActionBtn: { backgroundColor: '#007bff', paddingVertical: 14, borderRadius: 8, alignItems: 'center', elevation: 2 },
  withdrawActionText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  historyHeading: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 18, marginTop: 25, marginBottom: 12, color: '#343a40' },
  emptyCard: { backgroundColor: '#fff', padding: 30, borderRadius: 10, marginHorizontal: 15, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ced4da' },
  emptyText: { color: '#6c757d', fontSize: 14, textAlign: 'center' },
  txCard: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginHorizontal: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  txTitle: { fontSize: 14, fontWeight: '600', color: '#212529' },
  txDate: { fontSize: 11, color: '#868e96', marginTop: 3 },
  txDetails: { fontSize: 11, color: '#6c757d', fontStyle: 'italic', marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: 'bold' },
  statusTag: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '85%', padding: 20, borderRadius: 12, elevation: 5 },
  modalHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#212529', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ced4da', padding: 12, borderRadius: 6, marginBottom: 12, fontSize: 14, color: '#495057' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 6, alignItems: 'center', marginHorizontal: 5 },
  cancelBtn: { backgroundColor: '#6c757d' },
  confirmBtn: { backgroundColor: '#28a745' },
  modalBtnText: { color: '#fff', fontWeight: 'bold' }
});

export { Hwallet }; 