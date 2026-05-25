import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { db } from '../../pages/firebase';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Arriving = ({ navigation, route }) => {
  const { jobId } = route.params || {};
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);



  useEffect(() => {
    const getrequestdata= async()=>{
   const requestdata= AsyncStorage.getItem('requestdata');
   const parsedRequestData = requestdata ? JSON.parse(requestdata) : null;
   console.log("Parsed request data in arriving screen", parsedRequestData);

   setJobs([parsedRequestData]);
   console.log("Request data in arriving screen",requestdata)
   setLoading(false);
  }

  getrequestdata();
},[]);

  const onRefresh = () => {
    setRefreshing(true);
    // The snapshot listener updates automatically, but we can trigger it to verify connectivity
  };

  const confirmStartJob = (targetId, job) => {
    Alert.alert(
      'Confirm Arrival',
      'Has the househelp arrived at the location?',
      [
        { text: 'No, not yet', style: 'cancel' },
        { text: 'Yes, they arrived', onPress: () => handleStartJob(targetId, job) },
      ],
      { cancelable: true }
    );
  };

  const handleStartJob = async (targetId, job) => {
    try {
      const updatedData = {
        status: 'in-progress',
        startedAt: new Date(),
      };

      // Optimistic locally managed UI state update before server response fires back
      setJobs(prev =>
        prev.map(j => (j.id === targetId ? { ...j, ...updatedData } : j))
      );

      await db.collection('partimeRequest').doc(targetId).update(updatedData);
      Alert.alert("Success", "Job started successfully!");
      navigation.navigate("cstartjob")
    } catch (err) {
      console.error('Failed to start job:', err);
      Alert.alert("Error", "Could not update server tracker. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Header2 />
      <Cmenu navigation={navigation} />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#28a745" />
          <Text style={styles.loaderText}>Loading current appointment info...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#28a745']} />}
        >
          <Text style={styles.header}>Awaiting Househelp's Arrival</Text>

          {jobs.length === 0 ? (
            <Text style={styles.noJobText}>No active or confirmed bookings listed right now.</Text>
          ) : (
            jobs.map(job => (
              <View key={job.id} style={styles.jobCard}>
                <Text style={styles.jobTitle}>Househelp: {job.househelpName || 'Assigned Help'}</Text>
                <Text style={styles.jobInfo}><Text style={styles.boldLabel}>Job ID:</Text> {job.id}</Text>
                <Text style={styles.jobInfo}><Text style={styles.boldLabel}>Client:</Text> {job.clientName}</Text>
                <Text style={styles.jobInfo}><Text style={styles.boldLabel}>Phone:</Text> {job.phone}</Text>
                <Text style={styles.jobInfo}><Text style={styles.boldLabel}>Type:</Text> {job.requestType} ({job.apartmentType})</Text>
                <Text style={styles.jobInfo}><Text style={styles.boldLabel}>Address:</Text> {job.address}</Text>
                <Text style={styles.jobInfo}><Text style={styles.boldLabel}>Status:</Text> {job.status}</Text>
                <Text style={styles.jobInfo}><Text style={styles.boldLabel}>Total Cost:</Text> ₦{Number(job.totalCost).toLocaleString()}</Text>

                <Text style={styles.sectionTitle}>Chores Breakdown:</Text>
                {job.chores && job.chores.map((chore, index) => (
                  <Text key={index} style={styles.choreItem}>
                    • {chore.chore} — ₦{Number(chore.price).toLocaleString()}
                  </Text>
                ))}

                {job.househelpdata && (
                  <>
                    <Text style={styles.sectionTitle}>Househelp Profile:</Text>
                    <View style={styles.profileRow}>
                      {job.househelpdata.url && (
                        <Image source={{ uri: job.househelpdata.url }} style={styles.profileImage} />
                      )}
                      <View style={styles.profileDetails}>
                        <Text style={styles.profileText}>📞 {job.househelpdata.phonenumber}</Text>
                        <Text style={styles.profileText}>⭐ Exp: {job.househelpdata.experience} Years</Text>
                        <Text style={styles.profileText}>👤 Gender: {job.househelpdata.gender}</Text>
                      </View>
                    </View>
                  </>
                )}

                {job.status === 'confirmed' && (
                  <TouchableOpacity onPress={() => confirmStartJob(job.id, job)} style={styles.startButton}>
                    <Text style={styles.startButtonText}>Confirm Arrival & Start</Text>
                  </TouchableOpacity>
                )}
                {job.status === 'in-progress' && (
                  <View style={styles.statusBadge}>
                    <Text style={styles.inProgress}>⚡ Job in Progress</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollView: { paddingBottom: 40 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
  loaderText: { marginTop: 10, color: '#6c757d', fontSize: 14 },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#343a40' },
  noJobText: { textAlign: 'center', fontSize: 15, color: '#777', marginTop: 40, paddingHorizontal: 30 },
  jobCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginHorizontal: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  jobTitle: { fontSize: 18, fontWeight: 'bold', color: '#28a745', marginBottom: 12 },
  jobInfo: { fontSize: 15, color: '#495057', marginBottom: 6 },
  boldLabel: { fontWeight: '600', color: '#212529' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 15, marginBottom: 6, color: '#333', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee', paddingTop: 10 },
  choreItem: { fontSize: 14, color: '#555', marginLeft: 8, marginBottom: 4 },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  profileImage: { width: 70, height: 70, borderRadius: 35, marginRight: 15, backgroundColor: '#eee' },
  profileDetails: { flex: 1, gap: 3 },
  profileText: { fontSize: 14, color: '#495057' },
  startButton: { backgroundColor: '#28a745', padding: 14, borderRadius: 8, marginTop: 18, alignItems: 'center' },
  startButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  statusBadge: { backgroundColor: '#fff3cd', padding: 12, borderRadius: 6, marginTop: 15, alignItems: 'center', borderWidth: 1, borderColor: '#ffeeba' },
  inProgress: { color: '#856404', fontWeight: '700', fontSize: 15 }
});

export { Arriving };