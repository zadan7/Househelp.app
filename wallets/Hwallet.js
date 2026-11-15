import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../pages/firebase';
import { Hmenu } from '../component/Menu';
import { Header2 } from '../component/Header';
import { Card, Field, Button } from '../component/ui';
import { colors, space, radius, type, shadow } from '../component/theme';

const naira = (n) => `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const docExists = (snap) => (typeof snap.exists === 'function' ? snap.exists() : !!snap.exists);

const Hwallet = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [pending, setPending] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [providerId, setProviderId] = useState(null);
  const [help, setHelp] = useState({});

  const [modal, setModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let unsubWallet = () => {};
    let unsubTx = () => {};
    let created = false;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem('househelpdata');
        const user = raw ? JSON.parse(raw) : null;
        if (!user?.id) {
          Alert.alert('Session expired', 'Please log in again.');
          setLoading(false);
          return;
        }
        setHelp(user);
        setProviderId(user.id);
        if (user.accountnumber) setAccountNumber(String(user.accountnumber));

        // Fixed: this used `docSnap.exist` (typo), which was always falsy, so the wallet was
        // re-created with a zero balance on every update. It also read `balancee` (typo).
        unsubWallet = db.collection('provider_wallets').doc(user.id).onSnapshot(
          (snap) => {
            if (docExists(snap)) {
              const d = snap.data() || {};
              setBalance(d.balance || 0);
              setPending(d.pendingBalance || 0);
            } else if (!created) {
              created = true;
              db.collection('provider_wallets').doc(user.id).set({ balance: 0, pendingBalance: 0, totalEarned: 0 }).catch(() => {});
            }
          },
          () => {}
        );

        unsubTx = db.collection('transactions').where('userId', '==', user.id).onSnapshot(
          (qs) => {
            const list = [];
            qs.forEach((d) => list.push({ id: d.id, ...d.data() }));
            list.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTransactions(list);
            setLoading(false);
          },
          () => setLoading(false)
        );
      } catch (e) {
        setLoading(false);
      }
    })();

    return () => {
      unsubWallet();
      unsubTx();
    };
  }, []);

  const closeModal = () => {
    setModal(false);
    setAmount('');
    setBankName('');
  };

  const withdraw = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return Alert.alert('Invalid amount', 'Enter the amount you want to withdraw.');
    if (value > balance) return Alert.alert('Not enough funds', 'You cannot withdraw more than your available balance.');
    if (!/^\d{10}$/.test(accountNumber)) return Alert.alert('Check account number', 'Enter a valid 10-digit account number.');
    if (!bankName.trim()) return Alert.alert('Bank missing', 'Enter the name of your bank.');

    setProcessing(true);
    try {
      // One transaction: re-check the live balance, deduct it and log the payout together,
      // so a double-tap or two devices cannot overdraw the wallet.
      const walletRef = db.collection('provider_wallets').doc(providerId);
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(walletRef);
        const current = docExists(snap) ? (snap.data().balance || 0) : 0;
        if (value > current) throw new Error('INSUFFICIENT');
        tx.update(walletRef, { balance: current - value });
        tx.set(db.collection('transactions').doc(), {
          userId: providerId,
          type: 'Outflow',
          title: 'Payout withdrawal',
          amount: value,
          date: new Date().toISOString(),
          details: `To ${bankName.trim()} (${accountNumber})`,
          status: 'Pending',
        });
      });
      closeModal();
      Alert.alert('Withdrawal requested', 'Your payout is being processed.');
    } catch (e) {
      Alert.alert(
        e.message === 'INSUFFICIENT' ? 'Not enough funds' : 'Could not withdraw',
        e.message === 'INSUFFICIENT' ? 'Your balance changed. Please try again.' : 'Nothing was deducted. Check your connection and try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.root}>
      <Header2 />
      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: space.xxl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available to withdraw</Text>
            <Text style={styles.balanceAmount}>{naira(balance)}</Text>
            <View style={styles.pendingRow}>
              <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.85)" />
              <Text style={styles.pendingText}>{naira(pending)} pending clearance</Text>
            </View>
            <Button
              title={balance > 0 ? 'Withdraw to bank' : 'No funds to withdraw'}
              variant="secondary"
              onPress={() => setModal(true)}
              disabled={balance <= 0}
              style={styles.withdrawBtn}
            />
          </View>

          <Text style={[type.h2, { marginTop: space.lg, marginBottom: space.md }]}>Earnings and payouts</Text>
          {transactions.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={30} color={colors.muted} />
              <Text style={styles.emptyText}>No transactions yet. Completed jobs will appear here.</Text>
            </View>
          ) : (
            transactions.map((t) => {
              const inflow = t.type === 'Inflow';
              const d = new Date(t.date);
              return (
                <View key={t.id} style={styles.tx}>
                  <View style={[styles.txIcon, { backgroundColor: inflow ? colors.primarySoft : colors.dangerSoft }]}>
                    <Ionicons name={inflow ? 'arrow-down' : 'arrow-up'} size={18} color={inflow ? colors.primary : colors.danger} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txTitle}>{t.title}</Text>
                    <Text style={styles.txMeta}>
                      {isNaN(d) ? '' : `${d.toLocaleDateString()} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </Text>
                    {t.details ? <Text style={styles.txMeta}>{t.details}</Text> : null}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.txAmount, { color: inflow ? colors.primary : colors.danger }]}>
                      {inflow ? '+' : '-'}{naira(t.amount)}
                    </Text>
                    {t.status ? <Text style={[styles.txStatus, t.status === 'Pending' && { color: '#B7791F' }]}>{t.status}</Text> : null}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      <Modal visible={modal} animationType="slide" transparent onRequestClose={closeModal}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheet}>
            <Text style={type.h1}>Withdraw earnings</Text>
            <Text style={styles.sheetSub}>Available: {naira(balance)}</Text>
            <Field label="Amount (₦)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
            <Field label="Account number" value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" maxLength={10} />
            <Field label="Bank name" value={bankName} onChangeText={setBankName} placeholder="e.g. Access Bank, Kuda" />
            <Button title="Confirm withdrawal" onPress={withdraw} loading={processing} />
            <Button title="Cancel" variant="secondary" onPress={closeModal} disabled={processing} />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Hmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 110 },
  balanceCard: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: space.xl, ...shadow },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  balanceAmount: { color: colors.white, fontSize: 34, fontWeight: '800', marginTop: 4 },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.sm },
  pendingText: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  withdrawBtn: { marginTop: space.lg },
  empty: { alignItems: 'center', padding: space.xl, backgroundColor: colors.white, borderRadius: radius.lg, gap: space.sm },
  emptyText: { color: colors.muted, textAlign: 'center' },
  tx: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.white,
    borderRadius: radius.md, padding: space.md, marginBottom: space.sm, ...shadow,
  },
  txIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  txTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  txMeta: { fontSize: 12, color: colors.muted, marginTop: 1 },
  txAmount: { fontSize: 14, fontWeight: '800' },
  txStatus: { fontSize: 11, fontWeight: '700', color: colors.primary, marginTop: 2 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(8,20,14,0.5)' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: space.xl, gap: space.md },
  sheetSub: { color: colors.muted, marginTop: -space.sm },
});

export { Hwallet };
 