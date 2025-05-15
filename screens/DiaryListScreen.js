// 📁 app/DiaryListScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useColor } from '../contexts/ColorContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';

export default function DiaryListScreen() {
  const { currentUser } = useAuth();
  const { color } = useColor();
  const navigation = useNavigation();
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiaries = async () => {
      try {
        const ref = collection(db, 'diaries');
        const q = query(ref, where('userId', '==', currentUser.username), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);

        const results = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.date,
            text: data.text,
            emoji: data.emotion || '😊',
          };
        });
        setDiaries(results);
        setLoading(false);
      } catch (err) {
        console.error('일기 목록 로딩 실패:', err);
        setLoading(false);
      }
    };
    fetchDiaries();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Diary', { date: item.date })}>
      <Text style={styles.date}>{item.date} {item.emoji}</Text>
      <Text style={styles.preview} numberOfLines={1}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: color }]}> 
      <View style={styles.container}>
        <Text style={styles.title}>Diary List</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#888" />
        ) : (
          <FlatList
            data={diaries}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 20 }}
          />
        )}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
          <MaterialIcons name="arrow-back" size={28} color="#4E403B" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    color: '#4E403B'
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 1,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  item: {
    marginBottom: 15,
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
});
