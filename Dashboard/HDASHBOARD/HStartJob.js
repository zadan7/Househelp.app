import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
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

const HStartJob = ({ navigation, route }) => {
  const { job } = route.params;
  const [jobData, setJobData] = useState(job);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [paymentEnabled, setPaymentEnabled] = useState(false); // State for enabling payment button
  const [documentId, setDocumentId] = useState(null); // State to hold document ID

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
  
    const unsubscribe = onSnapshot(doc(db, 'partimeRequest', documentId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setJobData(data);
        setLoading(false);
  
        const allCompleted = data.chores.every((chore) => chore.completed);
        setIsCompleted(allCompleted);
      }
    });
  
    return () => unsubscribe();
  }, [documentId]);

  // Handle the rating stars
  const handleRating = (stars) => {
    setRating(stars);
  };

  // Handle payment (just a placeholder function for now)
  const handlePayment = () => {
    Alert.alert('Payment', 'Your payment has been processed successfully.');
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
          <View
            key={index}
            style={[styles.choreItem, chore.completed ? styles.choreCompleted : styles.chorePending]}
          >
            <Text style={styles.choreText}>
              {chore.chore} - ₦{Number(chore.price).toLocaleString()} {chore.completed ? '✅' : ''}
            </Text>
          </View>
        ))}

        {/* If all chores are completed, show the rating and comment section */}
        {isCompleted && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingHeader}>Rate the Client Hospitality</Text>
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

export { HStartJob };
