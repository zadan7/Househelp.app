import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { db } from '../../pages/firebase';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';
import { Card, Field, Button, InfoRow } from '../../component/ui';
import { colors, space, radius, type, shadow } from '../../component/theme';

const docExists = (snap) => (typeof snap.exists === 'function' ? snap.exists() : !!snap.exists);

// Star component for the rating system
const Star = ({ filled, onPress }) => (
  <TouchableOpacity onPress={onPress} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
    <Ionicons name={filled ? 'star' : 'star-outline'} size={38} color={filled ? colors.accent : colors.border} style={styles.star} />
  </TouchableOpacity>
);

const CStartJob = ({ navigation, route }) => {
  useKeepAwake(); // Keep the screen on while this component is active
  const { job } = route.params;
  const [jobData, setJobData] = useState(job);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [paymentEnabled, setPaymentEnabled] = useState(false); 
  const [documentId, setDocumentId] = useState(null); 
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Webview Modal state keys
  const [showWebView, setShowWebView] = useState(false);
  const [checkoutHtml, setCheckoutHtml] = useState('');

  const monnifyApiKey = "MK_TEST_TJDXJAS0YD";
  const monnifyContractCode = "5732437028";
  
  useEffect(() => {
    const fetchDocumentId = async () => {
      try {
        const storedJobId = await AsyncStorage.getItem('jobId');
        if (storedJobId) {
          setDocumentId(storedJobId);
        } else {
          // No stored job id: fall back to the job passed in via route params.
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    };

    fetchDocumentId();
  }, []);

  useEffect(() => {
    if (!documentId) return;

    const unsubscribe = db
      .collection('partimeRequest')
      .doc(documentId)
      .onSnapshot(
        (docSnap) => {
          if (docExists(docSnap)) {
            const data = docSnap.data();
            setJobData(data);
            setLoading(false);

            if (data && Array.isArray(data.chores) && data.chores.length > 0) {
              const allCompleted = data.chores.every((chore) => chore.completed);
              setIsCompleted(allCompleted);
            }
          }
        },
        () => {
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [documentId]);

  const toggleChore = async (index) => {
    if (!jobData || !documentId) return;

    const updatedChores = (jobData.chores || []).map((c) => ({ ...c }));

    if (updatedChores[index].completed) {
      Alert.alert('Notice', 'This chore has already been completed.');
      return;
    }

    updatedChores[index].completed = true;

    // Instantly reflect state changes locally
    try {
      await db.collection('partimeRequest').doc(documentId).update({
        chores: updatedChores,
      });

      setJobData((prevData) => ({
        ...prevData,
        chores: updatedChores,
      }));
    } catch (error) {
      Alert.alert("Error", "Failed to update chore status.");
    }
  };

  const handleRating = (stars) => {
    setRating(stars);
  };

  // --- DATABASE UPDATE UTILITY & REDIRECT ---
  const finalizeJobAndPayment = async (reference, totalAmount) => {
    try {
      const jobRef = db.collection('partimeRequest').doc(documentId);
      await jobRef.update({
        isjobcompleted: true,
        status: 'completed',
        rating: rating,
        comment: comment,
        completedAt: new Date().toISOString(),
        paymentRef: reference,
        amountPaid: totalAmount
      });

      await db.collection('transactions').add({
        userId: jobData.clientId || documentId,
        type: 'Outflow',
        title: 'Job Payment Settled',
        amount: totalAmount,
        date: new Date().toISOString(),
        reference: reference,
        details: `Paid to ${jobData.househelpName}`
      });

      setProcessingPayment(false);

      // Display dynamic confirmation notice and push the client back to their control center dashboard context
      Alert.alert(
        'Payment Successful', 
        `Your payment of ₦${Number(totalAmount).toLocaleString()} was processed securely. Thank you for your review!`,
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('cdashboard') 
          }
        ],
        { cancelable: false }
      );

    } catch (dbError) {
      setProcessingPayment(false);
      Alert.alert("Data Error", "Payment hit Monnify successfully but failed to update status locally.");
    }
  };

  // --- MONNIFY WEBVIEW BOOTSTRAPPING ---
  const handlePayment = () => {
    if (!jobData || !documentId) return;

    const totalAmount = (jobData.chores || []).reduce((sum, chore) => sum + Number(chore.price || 0), 0);

    if (totalAmount <= 0) {
      Alert.alert("Error", "Invalid payment value configuration detected.");
      return;
    }

    setProcessingPayment(true); // Lock the button to prevent double execution triggers

    const txRef = `JOB-${documentId}-${Date.now()}`;
    // Values are embedded in an inline <script>, so serialise them safely (names may contain quotes).
    const js = (v) => JSON.stringify(String(v)).replace(/</g, '\\u003c');
    const customerName = jobData.clientName || "Househelp Client";
    const customerEmail = jobData.clientEmail || "client@househelp.ng";
    const paymentDesc = `Payment for job by ${jobData.househelpName || 'Provider'}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script type="text/javascript" src="https://sdk.monnify.com/plugin/monnify.js"></script>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f8f9fa; font-family: sans-serif; margin: 0; }
            .loader { border: 4px solid #f3f3f3; border-radius: 50%; border-top: 4px solid #28a745; width: 40px; height: 40px; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div id="loader-container" class="loader"></div>
          <script type="text/javascript">
            document.addEventListener("DOMContentLoaded", function() {
              MonnifySDK.initialize({
                amount: ${totalAmount},
                currency: "NGN",
                reference: ${js(txRef)},
                customerName: ${js(customerName)},
                customerEmail: ${js(customerEmail)},
                apiKey: ${js(monnifyApiKey)},
                contractCode: ${js(monnifyContractCode)},
                paymentDescription: ${js(paymentDesc)},
                isTestMode: true,
                onComplete: function(response){
                  window.ReactNativeWebView.postMessage(JSON.stringify({status: 'SUCCESS', data: response}));
                },
                onClose: function(data){
                  window.ReactNativeWebView.postMessage(JSON.stringify({status: 'CANCELLED', data: data}));
                }
              });
            });
          </script>
        </body>
      </html>
    `;

    setCheckoutHtml(htmlContent);
    setShowWebView(true);
  };

  // --- HANDLE WEBVIEW BRIDGE COMMUNICATOR ---
  const onWebViewMessage = (event) => {
    try {
      const response = JSON.parse(event.nativeEvent.data);
      setShowWebView(false);

      if (response.status === 'SUCCESS' && response.data.transactionStatus === 'PAID') {
        const paidAmount = response.data.amountPayable;
        const finalRef = response.data.paymentReference;
        finalizeJobAndPayment(finalRef, paidAmount);
      } else {
        setProcessingPayment(false);
        Alert.alert('Payment Declined', 'The transaction was not authorized or cleared successfully.');
      }
    } catch (err) {
      setProcessingPayment(false);
      setShowWebView(false);
    }
  };

  const enablePaymentButton = () => {
    if (rating > 0 && comment.trim() !== '') {
      setPaymentEnabled(true);
    } else {
      setPaymentEnabled(false);
    }
  };

  useEffect(() => {
    enablePaymentButton();
  }, [rating, comment]);

  if (loading || !jobData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Loading job details...</Text>
      </View>
    );
  }

  const chores = jobData.chores || [];
  const doneCount = chores.filter((c) => c.completed).length;
  const total = chores.reduce((sum, c) => sum + Number(c.price || 0), 0);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Header2 />

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Card style={styles.statusCard}>
              <View style={styles.statusIcon}>
                <Ionicons name={isCompleted ? 'checkmark-done' : 'construct-outline'} size={28} color={colors.primary} />
              </View>
              <Text style={type.h2}>{isCompleted ? 'All chores done' : 'Job in progress'}</Text>
              <Text style={styles.muted}>
                {isCompleted
                  ? 'Rate the service below to complete payment.'
                  : `${doneCount} of ${chores.length} chores completed. Tap a chore once it is finished.`}
              </Text>
            </Card>

            <Card title="Job details" icon="person-outline">
              <View>
                <InfoRow label="Client" value={jobData.clientName} />
                <InfoRow label="Househelp" value={jobData.househelpName} />
                <InfoRow label="Total" value={`₦${total.toLocaleString()}`} last />
              </View>
            </Card>

            <Card title="Chores for job" icon="list-outline">
              {chores.length === 0 ? (
                <View style={styles.empty}>
                  <Ionicons name="clipboard-outline" size={32} color={colors.muted} />
                  <Text style={styles.muted}>No chores on this job yet.</Text>
                </View>
              ) : null}
              {chores.map((chore, index) => (
                <Pressable
                  key={index}
                  style={[styles.choreItem, chore.completed ? styles.choreCompleted : styles.chorePending]}
                  onPress={() => toggleChore(index)}
                >
                  <Ionicons
                    name={chore.completed ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={chore.completed ? colors.primary : colors.muted}
                  />
                  <Text style={styles.choreText}>{chore.chore}</Text>
                  <Text style={styles.chorePrice}>₦{Number(chore.price || 0).toLocaleString()}</Text>
                </Pressable>
              ))}
            </Card>

            {isCompleted && (
              <Card title="Rate the service" icon="star-outline">
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      filled={star <= rating}
                      onPress={() => handleRating(star)}
                    />
                  ))}
                </View>

                <Field
                  placeholder="Leave a comment..."
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  inputStyle={styles.commentBox}
                  onEndEditing={enablePaymentButton}
                />

                {paymentEnabled && (
                  <Button
                    title="Process Payment"
                    onPress={handlePayment}
                    loading={processingPayment}
                    disabled={processingPayment}
                  />
                )}
              </Card>
            )}
          </ScrollView>

          {/* Checkout Sheet Modal overlay structure view */}
          <Modal visible={showWebView} animationType="slide" transparent={false}>
            <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : 0, backgroundColor: colors.white }}>
              <View style={styles.webviewHeader}>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => {
                    setShowWebView(false);
                    setProcessingPayment(false);
                  }}
                >
                  <Ionicons name="close" size={20} color={colors.danger} />
                  <Text style={styles.closeText}>Close Checkout</Text>
                </TouchableOpacity>
                <Text style={styles.webviewTitle}>Secure Monnify Payment</Text>
              </View>
              <WebView
                source={{ html: checkoutHtml }}
                onMessage={onWebViewMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                  <ActivityIndicator size="large" color={colors.primary} style={StyleSheet.absoluteFill} />
                )}
              />
            </View>
          </Modal>

          <Cmenu navigation={navigation} />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 110 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  statusCard: { alignItems: 'center' },
  statusIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: space.sm, paddingVertical: space.md },
  choreItem: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 52, padding: space.md, borderRadius: radius.md, borderWidth: 1.5 },
  choreText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  chorePrice: { fontSize: 14, fontWeight: '700', color: colors.text },
  choreCompleted: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
  chorePending: { backgroundColor: colors.white, borderColor: colors.border },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg, gap: space.md },
  starsContainer: { flexDirection: 'row', justifyContent: 'center' },
  star: { marginHorizontal: 4 },
  commentBox: { minHeight: 80, textAlignVertical: 'top' },
  webviewHeader: { minHeight: 52, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, justifyContent: 'space-between' },
  closeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 48 },
  closeText: { color: colors.danger, fontSize: 15, fontWeight: '700' },
  webviewTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
});

export { CStartJob };
