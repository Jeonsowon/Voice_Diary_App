// 📁 app/screens/PastDiaryListScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useColor } from '../contexts/ColorContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';

export default function PastDiaryListScreen() {
  const { currentUser } = useAuth();
  const { color } = useColor();
  const navigation = useNavigation();
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const pad = (n) => n.toString().padStart(2, '0');

    const dateVariants = [
      { label: '작년 오늘', date: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()) },
      { label: '지난달 오늘', date: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()) },
      { label: '지난주 오늘', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7) }
    ];

    const formattedDates = dateVariants.map(d => ({
      label: d.label,
      date: `${d.date.getFullYear()}-${pad(d.date.getMonth() + 1)}-${pad(d.date.getDate())}`
    }));

    const fetchPastEntries = async () => {
      try {
        const ref = collection(db, 'diaries');
        const q = query(ref, where('userId', '==', currentUser.username));
        const snapshot = await getDocs(q);

        const found = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          formattedDates.forEach(({ label, date }) => {
            if (data.date === date) {
              found[label] = data;
            }
          });
        });

        setEntries(found);
        setLoading(false);
      } catch (err) {
        console.error('과거 일기 불러오기 실패:', err);
        setLoading(false);
      }
    };

    fetchPastEntries();
  }, []);

  const renderBlock = (label) => {
    const entry = entries[label];
    return (
      <View style={styles.block} key={label}>
        <Text style={styles.blockTitle}>{label}</Text>
        {entry ? (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('Diary', { date: entry.date })}
          >
            <Text style={styles.date}>{entry.date} {entry.emotion || ''}</Text>
            <Text style={styles.preview} numberOfLines={8}>{entry.text}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.noData}>일기 없음</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: color }]}> 
      <View style={styles.container}>
        <Text style={styles.title}>지난 오늘 하루</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#888" />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {['작년 오늘', '지난달 오늘', '지난주 오늘'].map(renderBlock)}
          </ScrollView>
        )}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#4E403B" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4E403B',
    padding: 20,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  block: {
    flex: 1,
    minHeight: 180,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4E403B',
  },
  item: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4E403B',
    marginBottom: 6,
  },
  preview: {
    fontSize: 14,
    color: '#4E403B',
  },
  noData: {
    fontSize: 14,
    color: '#888',
  },
});
