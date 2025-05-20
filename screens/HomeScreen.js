// 파일: app/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useColor } from '../contexts/ColorContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const screenHeight = Dimensions.get('window').height;
const pastelOptions = {
  'Gray': '#FAFAFA',
  'Pink': '#FFF2F2',
  'Yellow': '#FFFDE7',
  'Mint': '#F2FFF9',
  'Sky Blue': '#F0F8FF',
  'Purple': '#F9F2FF',
  'Beige': '#FDF6EC',
};
const textColor = '#4E403B';
const todayBackColor = '#FFB6B6';
const disabledTextColor = 'rgba(78,64,59,0.4)';

export default function HomeScreen() {
  const { isLoggedIn, logout, currentUser } = useAuth();
  const navigation = useNavigation();
  const { color, changeColor } = useColor();
  const [modalVisible, setModalVisible] = useState(false);
  const [emotionsByDate, setEmotionsByDate] = useState({});
  const todayString = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!isLoggedIn) {
      navigation.replace('Login');
    } else {
      const fetchEmotions = async () => {
        try {
          const ref = collection(db, 'diaries');
          const q = query(ref, where('userId', '==', currentUser.username));
          const snapshot = await getDocs(q);
          const map = {};
          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.date && data.emotion) {
              map[data.date] = data.emotion;
            }
          });
          setEmotionsByDate(map);
        } catch (err) {
          console.error('감정 로딩 오류:', err);
        }
      };
      fetchEmotions();
    }
  }, [isLoggedIn, navigation]);

  const onDayPress = (day) => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('Diary', { date: day.dateString });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: color }]}> 
      <View style={styles.container}> 
        <View style={styles.bottomRightButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('DiaryList')}>
            <MaterialIcons name="list" size={30} color={textColor} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('PastDiaryList')}>
            <MaterialIcons name="history" size={30} color={textColor} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('KeywordRanking')}>
            <MaterialIcons name="star" size={30} color={textColor} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => setModalVisible(true)}>
            <MaterialIcons name="palette" size={30} color={textColor} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={handleLogout}>
            <Feather name="log-out" size={30} color={textColor} />
          </TouchableOpacity>
        </View>

        <Modal
          transparent={true}
          animationType="fade"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Picker
                selectedValue={color}
                onValueChange={(itemValue) => {
                  changeColor(itemValue);
                  setModalVisible(false);
                }}>
                {Object.entries(pastelOptions).map(([label, value]) => (
                  <Picker.Item key={value} label={label} value={value} />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>

        <View style={[styles.calendarWrapper, { backgroundColor: color }]}>
          <Calendar
            disableAllTouchEventsForDisabledDays={true}
            hideDayNames={false}
            onDayPress={onDayPress}
            monthFormat={'MMMM yyyy'}
            style={{ backgroundColor: color }}
            dayComponent={({ date, state }) => {
              const dayOfWeek = new Date(date.dateString).getDay();
              const isSunday = dayOfWeek === 0;
              const isToday = date.dateString === todayString;
              const isDisabled = state === 'disabled';
              const emoji = emotionsByDate[date.dateString];

              return (
                <TouchableOpacity
                  onPress={() => onDayPress(date)}
                  style={{ width: '100%', height: 100, alignItems: 'center', backgroundColor: color }}>
                  <View style={isToday ? styles.todayCircle : null}>
                    <Text style={{ 
                      color: isDisabled ? disabledTextColor : (isSunday ? 'red' : textColor), 
                      fontSize: isToday ? 20 : 18, 
                      fontWeight: 'normal',
                    }}>
                      {date.day}
                    </Text>
                  </View>
                  {emoji && <Text style={{ fontSize: 18, marginTop: 2 }}>{emoji}</Text>}
                </TouchableOpacity>
              );
            }}
            theme={{
              backgroundColor: color,
              calendarBackground: color,
              textSectionTitleColor: textColor,
              dayTextColor: textColor,
              monthTextColor: textColor,
              arrowColor: textColor,
              textDayFontSize: 20,
              textMonthFontSize: 24,
              textDisabledColor: disabledTextColor,
              'stylesheet.calendar.header': {
                dayHeader: {
                  color: textColor,
                  fontSize: 14,
                  paddingTop: 15,
                  paddingBottom: 8,
                  alignItems: 'center',
                  justifyContent: 'center'
                },
              },
              'stylesheet.calendar.main': {
                container: {
                  backgroundColor: color,
                },
                week: {
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  backgroundColor: color,
                },
              },
            }}
          />
        </View>
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
    paddingTop: 10,
  },
  calendarWrapper: {
    height: screenHeight,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  todayCircle: {
    backgroundColor: todayBackColor,
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomRightButtons: {
    position: 'absolute',
    bottom: 20,
    right: 15,
    flexDirection: 'row',
    zIndex: 1,
  },
  iconButton: {
    backgroundColor: '#FFFFFFDD',
    padding: 6,
    marginLeft: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
});
