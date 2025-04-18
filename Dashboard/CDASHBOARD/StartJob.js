import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../pages/firebase';

import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Star component for the rating system
const Star = ({ filled, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={[styles.star, filled ? styles.filledStar : styles.emptyStar]}>★</Text>
  </TouchableOpacity>
);

const CStartJob = ({ navigation,route }) => {
  const { job } = route.params;
  const [jobData, setJobData] = useState(job);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [paymentEnabled, setPaymentEnabled] = useState(false); // Added state to track if payment can be enabled
const [documentId, setDocumentId] = useState(null); // State to hold document ID
   // Get the document ID from AsyncStorage
  console.log(documentId)
  console.log("job",job)
  console.log("jobData",jobData)

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
    console.log("documentId",documentId)
  
    const unsubscribe = onSnapshot(doc(db, 'partimeRequest', documentId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // setJobData(data);
        setLoading(false);
  
        const allCompleted = data.chores.every((chore) => chore.completed);
        setIsCompleted(allCompleted);
      }
    });
  
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
      await updateDoc(doc(db, 'partimeRequest', documentId), {
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

  const handlePayment = () => {
    // Implement payment processing logic here
    Alert.alert('Payment', 'Your payment has been processed successfully.');
    Alert.alert('Success', documentId);

    // code to update the job status in Firestore
    const jobRef = doc(db, 'partimeRequest', documentId);
    updateDoc(jobRef, {
      status: 'completed',
      rating: rating,
      comment: comment,
      //completedAt: new Date().toISOString(), // Optional: add a timestamp for when the job was completed
      // paymentStatus: 'paid', // Optional: add a payment status field
      // paymentDetails: paymentDetails, // Optional: add payment details if needed
      //code for completedAt timestamp
      completedAt: new Date().toISOString(), // Optional: add a timestamp for when the job was completed
    })
      .then(() => {
        Alert.alert('Success', 'Job marked as completed and payment processed.');
        // navigation.navigate('cmappage', { jobId: documentId });
      })
      .catch((error) => {
        console.error('Error updating job status:', error);
        Alert.alert('Error', 'Failed to update job status.');
      });
  };

  // Enable payment button only if rating and comment are provided
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

        {/* If all chores are completed, show the rating and comment section */}
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
              onEndEditing={enablePaymentButton} // Enable payment when user finishes editing the comment
            />

            {paymentEnabled && (
              <TouchableOpacity style={styles.paymentButton} onPress={handlePayment}>
                <Text style={styles.paymentText}>Process Payment</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#343a40',
  },
  choreItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  choreText: {
    fontSize: 16,
    fontWeight: '500',
  },
  choreCompleted: {
    backgroundColor: '#d4edda',
  },
  chorePending: {
    backgroundColor: '#f8d7da',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  ratingHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#343a40',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  star: {
    fontSize: 40,
    marginHorizontal: 5,
  },
  filledStar: {
    color: '#ffd700',
  },
  emptyStar: {
    color: '#d3d3d3',
  },
  commentBox: {
    height: 80,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 14,
    color: '#343a40',
  },
  paymentButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export { CStartJob };
