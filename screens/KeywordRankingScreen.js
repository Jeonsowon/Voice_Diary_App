// 📁 app/screens/KeywordRankingScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useColor } from '../contexts/ColorContext';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebase/firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';

export default function KeywordRankingScreen() {
  const { currentUser } = useAuth();
  const { color } = useColor();
  const navigation = useNavigation();
  const [keywords, setKeywords] = useState({ who: {}, where: {}, what: {} });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const formatMonth = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const monthKey = formatMonth(selectedMonth);
        const ref = collection(db, 'diaries');
        const q = query(ref, where('userId', '==', currentUser.username));
        const snapshot = await getDocs(q);

        const counters = { who: {}, where: {}, what: {} };
        const seenDates = new Set();

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.date?.startsWith(monthKey) && data.keywords) {
            if (seenDates.has(data.date)) return;
            seenDates.add(data.date);
            ['who', 'where', 'what'].forEach(type => {
              (data.keywords[type] || []).forEach(word => {
                counters[type][word] = (counters[type][word] || 0) + 1;
              });
            });
          }
        });

        setKeywords(counters);
        setLoading(false);
      } catch (e) {
        console.error('키워드 로딩 오류:', e);
        setLoading(false);
      }
    };
    fetchKeywords();
  }, [selectedMonth]);

  const renderKeywordList = (title, data) => {
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
    return (
      <View style={styles.block}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {sorted.length === 0 ? (
          <Text style={styles.noData}>데이터 없음</Text>
        ) : (
          sorted.slice(0, 5).map(([word, count], idx) => (
            <Text key={word} style={styles.item}>{`${idx + 1}. ${word} (${count}회)`}</Text>
          ))
        )}
      </View>
    );
  };

  const changeMonth = (offset) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setSelectedMonth(newMonth);
    setLoading(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: color }]}> 
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>⭐ 키워드 랭킹 ⭐</Text>
        </View>

        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
            <MaterialIcons name="chevron-left" size={28} color={"#4E403B"} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{selectedMonth.getFullYear()}년 {selectedMonth.getMonth() + 1}월</Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowButton}>
            <MaterialIcons name="chevron-right" size={28} color={"#4E403B"} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#888" />
        ) : (
          <FlatList
            data={['who', 'where', 'what']}
            keyExtractor={(item) => item}
            renderItem={({ item }) =>
              renderKeywordList(
                item === 'who' ? '👤 자주 만난 사람들' :
                item === 'where' ? '📍 자주 간 장소들' :
                '📝 자주 한 활동들',
                keywords[item]
              )
            }
            contentContainerStyle={styles.content}
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
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4E403B',
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
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  arrowButton: {
    padding: 6,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#4E403B',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#4E403B',
  },
  item: {
    fontSize: 16,
    color: '#4E403B',
    marginVertical: 2,
  },
  noData: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  content: {
    paddingBottom: 40,
  },
  block: {
    marginBottom: 20,
  },
});
