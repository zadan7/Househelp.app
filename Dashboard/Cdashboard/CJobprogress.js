import * as React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { Header } from '../../component/Header';
import { Footer } from '../../component/Footer';
import { db } from '../../pages/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

function CJobProgress({ navigation }) {
  const [jobdata, setJobData] = useState(null);
  const [chores, setChores] = useState([]);
  const [approvedChores, setApprovedChores] = useState({});
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  async function getData() {
    try {
      const currentData = await AsyncStorage.getItem("AcceptedJob");

      if (!currentData) {
        console.error("Error: No job ID found in AsyncStorage");
        return;
      }

      const jobId = currentData.startsWith('"') ? JSON.parse(currentData) : currentData;
      const jobRef = doc(db, 'partimeRequest', jobId);
      const jobSnap = await getDoc(jobRef);

      if (!jobSnap.exists()) {
        console.error("No job found in Firestore for ID:", jobId);
        return;
      }

      const data = jobSnap.data();
      setJobData(data);

      if (data.chores) {
        try {
          const parsedChores = JSON.parse(data.chores.replace(/'/g, '"')).map((chore) => {
            const parts = chore.split(':');
            return { task: parts[0].trim(), price: parts[1].split(',')[0].trim() };
          });
          setChores(parsedChores);

          // Load existing approval status
          const initialApprovedState = data.approvedChores || {};
          setApprovedChores(initialApprovedState);
        } catch (error) {
          console.error("Error parsing chores:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching job data:", error);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  const handleApproval = async (task) => {
    Alert.alert(
      "Confirm Approval",
      `Are you sure you approve the completion of "${task}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes, Approve",
          onPress: async () => {
            const updatedApprovals = { ...approvedChores, [task]: true };
            setApprovedChores(updatedApprovals);

            if (jobdata) {
              try {
                const jobRef = doc(db, 'partimeRequest', jobdata.id);
                await updateDoc(jobRef, { approvedChores: updatedApprovals });
              } catch (error) {
                console.error("Error updating Firestore:", error);
              }
            }
          }
        }
      ]
    );
  };

  const handleRating = (star) => {
    setRating(star);
    setHasRated(true);
  };

  const handleCompleteJob = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please provide a rating before completing the job.");
      return;
    }

    Alert.alert(
      "Complete Job & Payment",
      "Are you sure you want to complete the job and process the payment?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm Payment",
          onPress: async () => {
            if (jobdata) {
              try {
                const jobRef = doc(db, 'partimeRequest', jobdata.id);
                await updateDoc(jobRef, { status: "Completed", paymentStatus: "Paid", rating });

                Alert.alert("Success", "Job has been completed and payment processed!");
                navigation.goBack(); // Redirect after completion
              } catch (error) {
                console.error("Error updating Firestore:", error);
              }
            }
          }
        }
      ]
    );
  };

  // Check if all chores are approved
  const allApproved = chores.length > 0 && chores.every(chore => approvedChores[chore.task]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header navigation={navigation} />

      <View style={styles.content}>
        {jobdata && (
          <View style={styles.jobDetails}>
            <Text style={styles.jobHeader}>Job Details</Text>
            <Text style={styles.jobText}><Text style={styles.bold}>Worker:</Text> {jobdata.workerName}</Text>
            <Text style={styles.jobText}><Text style={styles.bold}>Location:</Text> {jobdata.address}, {jobdata.LGA}, {jobdata.state}</Text>
            <Text style={styles.jobText}><Text style={styles.bold}>Total Amount:</Text> ₦{jobdata.amount}</Text>

            <Text style={styles.jobHeader}>Chores to Approve</Text>
            {chores.length > 0 ? (
              chores.map((chore, index) => (
                <Pressable 
                  key={index} 
                  style={[
                    styles.choreButton, 
                    approvedChores[chore.task] ? styles.choreApproved : styles.chorePending
                  ]}
                  onPress={() => handleApproval(chore.task)}
                  disabled={approvedChores[chore.task]}
                >
                  <Text style={styles.choreText}>
                    {chore.task} - ₦{chore.price}
                  </Text>
                </Pressable>
              ))
            ) : (
              <Text style={styles.noChores}>No chores available</Text>
            )}

            {/* Show rating system only if all chores are approved */}
            {allApproved && (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>Rate the Worker</Text>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable key={star} onPress={() => handleRating(star)}>
                      <FontAwesome 
                        name={star <= rating ? "star" : "star-o"} 
                        size={30} 
                        color={star <= rating ? "#FFD700" : "#ccc"} 
                        style={styles.star}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Show "Complete Job & Payment" button only if all chores are approved and rated */}
            {allApproved && hasRated && (
              <Pressable style={styles.completeButton} onPress={handleCompleteJob}>
                <Text style={styles.buttonText}>Complete Job & Payment</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', alignItems: 'center', paddingVertical: 20 },
  content: { width: '90%', maxWidth: 500, alignItems: 'center', backgroundColor: '#f8f9fa', padding: 20, borderRadius: 12, shadowColor: '#000', elevation: 4 },
  jobDetails: { width: '100%', backgroundColor: '#fff', padding: 15, borderRadius: 10 },
  jobHeader: { fontSize: 20, fontWeight: 'bold', color: '#28a745' },
  choreButton: { padding: 10, borderRadius: 8, marginVertical: 5 },
  choreApproved: { backgroundColor: '#28a745' },
  chorePending: { backgroundColor: '#f8d210' },
  ratingContainer: { alignItems: 'center', marginTop: 20 },
  ratingText: { fontSize: 18, fontWeight: 'bold' },
  stars: { flexDirection: 'row', marginTop: 10 },
  star: { marginHorizontal: 5 },
  completeButton: { backgroundColor: '#007bff', padding: 14, borderRadius: 10, marginTop: 20 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});

export { CJobProgress };
