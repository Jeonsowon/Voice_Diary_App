// 📁 app/DiaryScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import { transcribeAudio } from '../utils/transcribeAudio';
import { summarizeText } from '../utils/summarizeText';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const screenHeight = Dimensions.get('window').height;
const textColor = '#4E403B';

export default function DiaryScreen({ route }) {
  const { isLoggedIn } = useAuth();
  const navigation = useNavigation();
  const [recording, setRecording] = useState(null);
  const [diaryText, setDiaryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { date } = route.params;

  useEffect(() => {
    if (!isLoggedIn) {
      navigation.replace('Login');
    }
  }, [isLoggedIn, navigation]);

  async function startRecording() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('마이크 권한이 필요합니다.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('녹음 시작 에러:', err);
    }
  }

  async function stopRecording() {
    try {
      setIsLoading(true);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      const response = await transcribeAudio(uri);
      if (response?.text) {
        const summaryResult = await summarizeText(response.text);
        setDiaryText(summaryResult);
      } else {
        setDiaryText('(변환 실패)');
      }
    } catch (err) {
      console.error('오류:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{date}</Text>
        </View>
        
        <View style={styles.textContainer}>
          <TextInput
            style={styles.textInput}
            multiline
            value={diaryText}
            onChangeText={setDiaryText}
            placeholder="오늘의 일기를 작성해보세요..."
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.recordingContainer}>
          {recording ? (
            <TouchableOpacity 
              style={[styles.recordingButton, styles.stopButton]} 
              onPress={stopRecording} 
              disabled={isLoading}>
              <MaterialIcons name="stop" size={30} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.recordingButton, styles.startButton]} 
              onPress={startRecording} 
              disabled={isLoading}>
              <MaterialIcons name="mic" size={30} color="white" />
            </TouchableOpacity>
          )}
          {isLoading && (
            <Text style={styles.loadingText}>처리 중입니다...</Text>
          )}
        </View>
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
  dateContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dateText: {
    fontSize: 18,
    color: textColor,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 0.7,
    padding: 20,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: textColor,
    textAlignVertical: 'top',
  },
  recordingContainer: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  recordingButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButton: {
    backgroundColor: '#FFB6B6',
  },
  stopButton: {
    backgroundColor: '#FF6B6B',
  },
  loadingText: {
    marginTop: 10,
    color: textColor,
    fontSize: 14,
  },
});