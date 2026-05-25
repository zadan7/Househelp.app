import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { db } from '../../pages/firebase';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';

// Star component for the rating system
const Star = ({ filled, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={[styles.star, filled ? styles.filledStar : styles.emptyStar]}>★</Text>
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
        }
      } catch (error) {
        console.error('Error retrieving jobId from AsyncStorage:', error);
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
          if (docSnap.exists) { 
            const data = docSnap.data();
            setJobData(data);
            setLoading(false);

            if (data && data.chores) {
              const allCompleted = data.chores.every((chore) => chore.completed);
              setIsCompleted(allCompleted);
            }
          }
        },
        (error) => {
          console.error("Error listening to document changes:", error);
        }
      );

    return () => unsubscribe();
  }, [documentId]);

  const toggleChore = async (index) => {
    if (!jobData || !documentId) return;

    const updatedChores = [...jobData.chores];

    if (updatedChores[index].completed) {
      Alert.alert('Notice', 'This chore has already been completed.');
      return;
    }

    updatedChores[index].completed = true;

    try {
      await db.collection('partimeRequest').doc(documentId).update({
        chores: updatedChores,
      });

      setJobData((prevData) => ({
        ...prevData,
        chores: updatedChores,
      }));
    } catch (error) {
      console.error("Error updating chore status:", error);
      Alert.alert("Error", "Failed to update chore status.");
    }
  };

  const handleRating = (stars) => {
    setRating(stars);
  };

  // --- DATABASE UPDATE UTILITY ---
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

      Alert.alert('Success', 'Payment processed and job finalized successfully.');
      navigation.goBack();
    } catch (dbError) {
      console.error("Error updating firestore tracking documents:", dbError);
      Alert.alert("Data Error", "Payment hit Monnify successfully but failed to update status locally.");
    }
  };

  // --- MONNIFY WEBVIEW BOOTSTRAPPING ---
  const handlePayment = () => {
    if (!jobData || !documentId) return;

    const totalAmount = jobData.chores.reduce((sum, chore) => sum + Number(chore.price || 0), 0);

    if (totalAmount <= 0) {
      Alert.alert("Error", "Invalid payment value configuration detected.");
      return;
    }

    const txRef = `JOB-${documentId}-${Date.now()}`;
    const customerName = jobData.clientName || "Househelp Client";
    const customerEmail = jobData.clientEmail || "client@househelp.ng";
    const paymentDesc = `Payment for job by ${jobData.househelpName || 'Provider'}`;

    // Inline structural injection script handling the payment logic seamlessly
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
                reference: "${txRef}",
                customerName: "${customerName}",
                customerEmail: "${customerEmail}",
                apiKey: "${monnifyApiKey}",
                contractCode: "${monnifyContractCode}",
                paymentDescription: "${paymentDesc}",
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
        Alert.alert('Payment Declined', 'The transaction was not authorized or cleared successfully.');
      }
    } catch (err) {
      console.error("Parsing message failed:", err);
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
        <ActivityIndicator size="large" color="#28a745" />
        <Text>Loading job details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Header2 />
          <Cmenu navigation={navigation} />

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.header}>Client: {jobData.clientName}</Text>
            <Text style={styles.header}>Househelp: {jobData.househelpName}</Text>

            <Text style={styles.header}>Chores for Job</Text>

            {jobData.chores.map((chore, index) => (
              <Pressable
                key={index}
                style={[styles.choreItem, chore.completed ? styles.choreCompleted : styles.chorePending]}
                onPress={() => toggleChore(index)}
              >
                <Text style={styles.choreText}>
                  {chore.chore} - ₦{Number(chore.price).toLocaleString()}{chore.completed ? ' ✅' : ''}
                </Text>
              </Pressable>
            ))}

            {isCompleted && (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingHeader}>Rate the Service</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      filled={star <= rating}
                      onPress={() => handleRating(star)}
                    />
                  ))}
                </View>

                <TextInput
                  style={styles.commentBox}
                  placeholder="Leave a comment..."
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  onEndEditing={enablePaymentButton}
                />

                {paymentEnabled && (
                  <TouchableOpacity 
                    style={[styles.paymentButton, processingPayment && { backgroundColor: '#6c757d' }]} 
                    onPress={handlePayment}
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.paymentText}>Process Payment</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>

          {/* Checkout Sheet Modal overlay structure view */}
          <Modal visible={showWebView} animationType="slide" transparent={false}>
            <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : 0 }}>
              <View style={styles.webviewHeader}>
                <TouchableOpacity onPress={() => setShowWebView(false)}>
                  <Text style={styles.closeText}>✕ Close Checkout</Text>
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
                  <ActivityIndicator size="large" color="#28a745" style={StyleSheet.absoluteFill} />
                )}
              />
            </View>
          </Modal>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  header: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#343a40' },
  choreItem: { padding: 15, borderRadius: 10, marginBottom: 10 },
  choreText: { fontSize: 16, fontWeight: '500' },
  choreCompleted: { backgroundColor: '#d4edda' },
  chorePending: { backgroundColor: '#f8d7da' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ratingContainer: { marginTop: 20, paddingHorizontal: 20, backgroundColor: '#fff', borderRadius: 10, paddingVertical: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  ratingHeader: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#343a40' },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  star: { fontSize: 40, marginHorizontal: 5 },
  filledStar: { color: '#ffd700' },
  emptyStar: { color: '#d3d3d3' },
  commentBox: { height: 80, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15, paddingHorizontal: 10, paddingVertical: 5, fontSize: 14, color: '#343a40' },
  paymentButton: { backgroundColor: '#28a745', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  paymentText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  webviewHeader: { height: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, justifyContent: 'space-between' },
  closeText: { color: '#dc3545', fontSize: 16, fontWeight: 'bold' },
  webviewTitle: { fontSize: 16, fontWeight: '600', color: '#343a40' }
});

export { CStartJob };