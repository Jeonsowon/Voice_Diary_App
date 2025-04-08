// 📁 app/screens/HomeScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';

const screenHeight = Dimensions.get('window').height;
const pastelOptions = {
  '민트화이트': '#F2FFF9',
  '핑크화이트': '#FFF2F2',
  '옐로우화이트': '#FFFDE7',
  '퍼플화이트': '#F9F2FF',
  '블루화이트': '#F0F8FF',
  '베이지화이트': '#FDF6EC',
  '그레이화이트': '#FAFAFA'
};
const textColor = '#4E403B'
const todayBackColor = '#FFB6B6'

export default function HomeScreen({ navigation }) {
  const [backgroundColor, setBackgroundColor] = useState(pastelOptions['민트화이트']);
  const [modalVisible, setModalVisible] = useState(false);
  const todayString = new Date().toISOString().split('T')[0];

  const onDayPress = (day) => {
    navigation.navigate('Diary', { date: day.dateString });
  };

  return (
    <View style={[styles.container, { backgroundColor }]}> 
      <TouchableOpacity 
        style={styles.colorButton} 
        onPress={() => setModalVisible(true)}>
        <Text style={{ color: textColor }}>🎨</Text>
      </TouchableOpacity>

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
          hideDayNames={false}
          onDayPress={onDayPress}
          style={{ backgroundColor }}
          dayComponent={({ date }) => {
            const dayOfWeek = new Date(date.dateString).getDay();
            const isSunday = dayOfWeek === 0;
            const isToday = date.dateString === todayString;

            return (
              <View style={{ height: 110, alignItems: 'center', backgroundColor }}>
                <View style={isToday ? styles.todayCircle : null}>
                  <Text style={{ 
                    color: isSunday ? 'red' : textColor, 
                    fontSize: isToday ? 20 : 18, 
                    fontWeight: 'normal', 
                  }}>
                    {date.day}
                  </Text>
                </View>
              </View>
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
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  calendarWrapper: {
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
  colorButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 1,
    backgroundColor: '#FFFFFFAA',
    padding: 6,
    borderRadius: 20,
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