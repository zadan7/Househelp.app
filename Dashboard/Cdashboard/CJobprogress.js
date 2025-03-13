import * as React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Alert, Image } from 'react-native';
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
      if (!currentData) return;
      
      const jobId = JSON.parse(currentData);
      const jobRef = doc(db, 'partimeRequest', jobId);
      const jobSnap = await getDoc(jobRef);

      if (!jobSnap.exists()) return;
      const data = jobSnap.data();
      setJobData(data);
      
      if (data.chores) {
        const parsedChores = JSON.parse(data.chores.replace(/'/g, '"'))
          .map(chore => ({ task: chore.split(':')[0].trim(), price: chore.split(':')[1].trim() }));
        setChores(parsedChores);
        setApprovedChores(data.approvedChores || {});
      }
    } catch (error) {
      console.error("Error fetching job data:", error);
    }
  }

  useEffect(() => { getData(); }, []);

  const handleApproval = async (task) => {
    Alert.alert("Confirm Approval", `Approve completion of ${task}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Approve", onPress: async () => {
        const updatedApprovals = { ...approvedChores, [task]: true };
        setApprovedChores(updatedApprovals);
        await updateDoc(doc(db, 'partimeRequest', jobdata.id), { approvedChores: updatedApprovals });
      }}
    ]);
  };

  const handleRating = (star) => { setRating(star); setHasRated(true); };

  const handleCompleteJob = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please rate the worker before completing.");
      return;
    }
    Alert.alert("Complete Job & Payment", "Confirm job completion?", [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", onPress: async () => {
        await updateDoc(doc(db, 'partimeRequest', jobdata.id), { status: "Completed", paymentStatus: "Paid", rating });
        Alert.alert("Success", "Job completed and payment processed!");
        navigation.goBack();
      }}
    ]);
  };

  const allApproved = chores.length > 0 && chores.every(chore => approvedChores[chore.task]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header navigation={navigation} />
      <View style={styles.content}>
        {jobdata && (
          <View style={styles.jobDetails}>
            <Text style={styles.jobHeader}>Worker Details</Text>
            <Image source={{ uri: jobdata.workerPhoto }} style={styles.profilePic} />
            <Text style={styles.workerName}>{jobdata.workerName}</Text>
            <Text style={styles.jobText}><Text style={styles.bold}>Contact:</Text> {jobdata.workerContact}</Text>
            <Text style={styles.jobText}><Text style={styles.bold}>Experience:</Text> {jobdata.workerExperience} years</Text>
            
            <Text style={styles.jobHeader}>Chores to Approve</Text>
            {chores.map((chore, index) => (
              <Pressable key={index} style={[styles.choreButton, approvedChores[chore.task] ? styles.choreApproved : styles.chorePending]} onPress={() => handleApproval(chore.task)} disabled={approvedChores[chore.task]}>
                <Text style={styles.choreText}>{chore.task} - ₦{chore.price}</Text>
              </Pressable>
            ))}
            
            {allApproved && (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>Rate the Worker</Text>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable key={star} onPress={() => handleRating(star)}>
                      <FontAwesome name={star <= rating ? "star" : "star-o"} size={30} color={star <= rating ? "#FFD700" : "#ccc"} style={styles.star} />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

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
  profilePic: { width: 80, height: 80, borderRadius: 40, marginVertical: 10 },
  workerName: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  choreButton: { padding: 10, borderRadius: 8, marginVertical: 5, textAlign: 'center' },
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