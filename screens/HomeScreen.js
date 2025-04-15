// 파일: app/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

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
  const { isLoggedIn, logout } = useAuth();
  const navigation = useNavigation();
  const [backgroundColor, setBackgroundColor] = useState(pastelOptions['Gray']);
  const [modalVisible, setModalVisible] = useState(false);
  const todayString = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!isLoggedIn) {
      navigation.replace('Login');
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.container}> 
        <View style={styles.bottomRightButtons}>
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
                selectedValue={backgroundColor}
                onValueChange={(itemValue) => {
                  setBackgroundColor(itemValue);
                  setModalVisible(false);
                }}>
                {Object.entries(pastelOptions).map(([label, value]) => (
                  <Picker.Item key={value} label={label} value={value} />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>

        <View style={[styles.calendarWrapper, { backgroundColor }]}>
          <Calendar
            disableAllTouchEventsForDisabledDays={true}
            hideDayNames={false}
            onDayPress={onDayPress}
            style={{ backgroundColor }}
            dayComponent={({ date, state }) => {
              const dayOfWeek = new Date(date.dateString).getDay();
              const isSunday = dayOfWeek === 0;
              const isToday = date.dateString === todayString;
              const isDisabled = state === 'disabled';

              return (
                <TouchableOpacity
                  onPress={() => onDayPress(date)}
                  style={{ width: '100%', height: 100, alignItems: 'center', backgroundColor }}>
                  <View style={isToday ? styles.todayCircle : null}>
                    <Text style={{ 
                      color: isDisabled ? disabledTextColor : (isSunday ? 'red' : textColor), 
                      fontSize: isToday ? 20 : 18, 
                      fontWeight: 'normal', 
                    }}>
                      {date.day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            theme={{
              backgroundColor: backgroundColor,
              calendarBackground: backgroundColor,
              textSectionTitleColor: textColor,
              dayTextColor: textColor,
              monthTextColor: textColor,
              arrowColor: textColor,
              textDayFontSize: 20,
              textMonthFontSize: 20,
              textDisabledColor: disabledTextColor,
              textMonthFontSize: 24,

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
                  backgroundColor: backgroundColor,
                },
                week: {
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  backgroundColor: backgroundColor,
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
