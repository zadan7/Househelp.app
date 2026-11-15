import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../pages/firebase';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import { Card, Field, Select, Button } from '../../component/ui';
import { colors, space, radius, type, shadow } from '../../component/theme';
import { Timestamp } from 'firebase/firestore';
import { CommonActions } from '@react-navigation/native';

const SALARIES = ['N50,000', 'N60,000', 'N70,000', 'N80,000', 'N90,000', 'N100,000', 'N120,000', 'N150,000', 'N200,000', 'N250,000', 'N300,000'];

const Page = ({ navigation, title, subtitle, children }) => (
  <View style={styles.container}>
    <Header2 />
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <Text style={type.h1}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </ScrollView>
    <Cmenu navigation={navigation} />
  </View>
);

const loadClient = async (setClient) => {
  try {
    const storedData = await AsyncStorage.getItem('clientdata');
    if (storedData) setClient(JSON.parse(storedData));
  } catch (e) {}
};

const CFulltimelivein = ({ navigation }) => {
  const [client, setClient] = useState(null);
  const [description, setDescription] = useState('');
  const [chores, setChores] = useState('');
  const [salaryRange, setSalaryRange] = useState('N50,000');
  const [numberOfKids, setNumberOfKids] = useState('');
  const [secondaryProvision, setSecondaryProvision] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadClient(setClient);
  }, []);

  const handleSubmit = async () => {
    if (!client || !description || !chores || numberOfKids === '') {
      return Alert.alert('Incomplete Form', 'Please fill in all required fields.');
    }

    setSubmitting(true);
    try {
      const fulltimeRequestdata = await db.collection('fulltimeRequest').add({
        clientData: client,
        requestType: 'fulltime-livein',
        description: description,
        secondaryProvision: secondaryProvision,
        salary: salaryRange,
        kidsnum: numberOfKids,
        chores: chores.split(',').map((c) => c.trim()),
        status: 'pending',
        createdAt: Timestamp.now(),
      });

      if (fulltimeRequestdata) {
        const fulltimeRequestdataid = fulltimeRequestdata.id;
        await db.collection('fulltimeRequest').doc(fulltimeRequestdataid).update({
          id: fulltimeRequestdataid,
        });
        setModalVisible(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Page navigation={navigation} title="Full-time live-in" subtitle="Tell us about the househelp who will live in your home.">
        <Card title="The job" icon="document-text-outline">
          <Field
            label="Job description"
            hint="Take your time to describe exactly what you want from the househelp."
            placeholder="Describe what the househelp will do"
            value={description}
            onChangeText={setDescription}
            multiline
            inputStyle={styles.multiline}
          />
          <Field
            label="Chores (comma-separated)"
            placeholder="e.g., Cleaning, Cooking, Babysitting"
            value={chores}
            onChangeText={setChores}
          />
          <Field
            label="Number of kids"
            placeholder="Enter number of kids"
            keyboardType="numeric"
            value={numberOfKids}
            onChangeText={setNumberOfKids}
          />
        </Card>

        <Card title="Pay and benefits" icon="wallet-outline">
          <Select label="Salary range (monthly)" value={salaryRange} onChange={setSalaryRange} items={SALARIES} />
          <Field
            label="Secondary provision"
            hint="Describe what you can provide outside her salary, e.g. meals, basic health care."
            placeholder="Not compulsory, but it will help you get a better househelp"
            multiline
            value={secondaryProvision}
            onChangeText={setSecondaryProvision}
            inputStyle={styles.multiline}
          />
        </Card>

        <Button title="Submit request" onPress={handleSubmit} loading={submitting} />
      </Page>

      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="checkmark-circle" size={44} color={colors.primary} />
            </View>
            <Text style={type.h2}>Thank you for your request!</Text>
            <Text style={styles.modalText}>
              We have successfully received your submission. A househelp will get in touch soon.
            </Text>
            <Button
              title="Close"
              style={{ alignSelf: 'stretch' }}
              onPress={() => {
                setModalVisible(false);
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'cdashboard' }],
                  })
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const CFulltimeliveout = ({ navigation }) => {
  const [client, setClient] = useState(null);
  const [description, setDescription] = useState('');
  const [chores, setChores] = useState('');
  const [salaryRange, setSalaryRange] = useState('N50,000');
  const [numberOfKids, setNumberOfKids] = useState('');
  const [resumptionTime, setResumptionTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadClient(setClient);
  }, []);

  const handleSubmit = async () => {
    if (!client || !description || !chores || numberOfKids === '' || !resumptionTime || !closingTime) {
      return Alert.alert('Incomplete Form', 'Please fill in all required fields.');
    }

    setSubmitting(true);
    try {
      const fulltimeRequestdata = await db.collection('fulltimeRequest').add({
        clientData: client,
        requestType: 'fulltime-liveout',
        description: description,
        salary: salaryRange,
        kidsnum: numberOfKids,
        chores: chores.split(',').map((c) => c.trim()),
        resumptionTime: resumptionTime,
        closingTime: closingTime,
        status: 'pending',
        // Fixed: db.constructor.Timestamp is undefined and threw on every live-out submit.
        createdAt: Timestamp.now(),
      });

      if (fulltimeRequestdata) {
        const fulltimeRequestdataid = fulltimeRequestdata.id;
        await db.collection('fulltimeRequest').doc(fulltimeRequestdataid).update({
          id: fulltimeRequestdataid,
        });
      }

      Alert.alert('Success', 'Your request has been submitted!');
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page navigation={navigation} title="Full-time live-out" subtitle="Tell us about the househelp who will work set hours and go home.">
      <Card title="The job" icon="document-text-outline">
        <Field
          label="Job description"
          hint="Take your time to describe exactly what you want from the househelp."
          placeholder="Describe what the househelp will do"
          value={description}
          onChangeText={setDescription}
          multiline
          inputStyle={styles.multiline}
        />
        <Field
          label="Chores (comma-separated)"
          placeholder="e.g., Cleaning, Cooking, Babysitting"
          value={chores}
          onChangeText={setChores}
        />
        <Field
          label="Number of kids"
          placeholder="Enter number of kids"
          keyboardType="numeric"
          value={numberOfKids}
          onChangeText={setNumberOfKids}
        />
      </Card>

      <Card title="Pay and hours" icon="time-outline">
        <Select label="Salary range (monthly)" value={salaryRange} onChange={setSalaryRange} items={SALARIES} />
        <Field
          label="Resumption time"
          placeholder="e.g., 8:00 AM"
          value={resumptionTime}
          onChangeText={setResumptionTime}
        />
        <Field
          label="Closing time"
          placeholder="e.g., 5:00 PM"
          value={closingTime}
          onChangeText={setClosingTime}
        />
      </Card>

      <Button title="Submit request" onPress={handleSubmit} loading={submitting} />
    </Page>
  );
};

const CHOICES = [
  { route: 'cfulltimelivein', icon: 'bed-outline', title: 'Live-in househelp', text: 'Lives in your home and supports you around the clock.' },
  { route: 'cfulltimeliveout', icon: 'sunny-outline', title: 'Live-out househelp', text: 'Works agreed hours each day and goes home after closing.' },
];

const CFulltimeSelection = ({ navigation }) => {
  return (
    <Page navigation={navigation} title="Full-time selection" subtitle="Choose the arrangement that suits your household.">
      {CHOICES.map((o) => (
        <TouchableOpacity key={o.route} style={styles.option} activeOpacity={0.85} onPress={() => navigation.navigate(o.route)}>
          <View style={styles.optionIcon}>
            <Ionicons name={o.icon} size={26} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.h2}>{o.title}</Text>
            <Text style={styles.optionText}>{o.text}</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.muted} />
        </TouchableOpacity>
      ))}
    </Page>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: space.lg, paddingBottom: 110 },
  subtitle: { ...type.body, color: colors.muted, marginTop: space.xs, marginBottom: space.lg },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.white,
    borderRadius: radius.lg, padding: space.lg, marginBottom: space.md, minHeight: 48, ...shadow,
  },
  optionIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  optionText: { color: colors.muted, fontSize: 13, marginTop: 2, lineHeight: 18 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: space.lg },
  modalContent: { backgroundColor: colors.white, padding: space.xl, borderRadius: radius.lg, alignItems: 'center', width: '100%', gap: space.md, ...shadow },
  modalIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  modalText: { color: colors.muted, fontSize: 15, textAlign: 'center', lineHeight: 21 },
});

export { CFulltimelivein, CFulltimeliveout, CFulltimeSelection };
