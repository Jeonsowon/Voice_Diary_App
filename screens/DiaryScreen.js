// 📁 app/DiaryScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, SafeAreaView, Alert, Keyboard } from 'react-native';
import { Audio } from 'expo-av';
import { transcribeAudio } from '../utils/transcribeAudio';
import { summarizeText } from '../utils/summarizeText';
import { saveDiary, fetchDiary, deleteDiary } from '../utils/diaryService';
import { recommendSongsFromDiary } from '../utils/recommendSongsGPT';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useColor } from '../contexts/ColorContext';
import { useNavigation } from '@react-navigation/native';

const screenHeight = Dimensions.get('window').height;
const textColor = '#4E403B';

export default function DiaryScreen({ route }) {
  const { isLoggedIn, currentUser } = useAuth();
  const { color } = useColor();
  const navigation = useNavigation();
  const [recording, setRecording] = useState(null);
  const [diaryText, setDiaryText] = useState('');
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [emotionEmoji, setEmotionEmoji] = useState('🎵');
  const [isLoading, setIsLoading] = useState(false);
  const { date } = route.params;

  useEffect(() => {
    if (!isLoggedIn) {
      navigation.replace('Login');
    } else {
      const loadDiary = async () => {
        const result = await fetchDiary({ userId: currentUser.username, date });
        if (result?.text) setDiaryText(result.text);
        if (result?.songs) setRecommendedSongs(result.songs);
        if (result?.emotion) setEmotionEmoji(result.emotion);
      };
      loadDiary();
    }
  }, [isLoggedIn, navigation, date]);

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
        const summary = await summarizeText(response.text);
        const result = await recommendSongsFromDiary(summary);

        setDiaryText(summary);
        setRecommendedSongs(result.songs || []);
        setEmotionEmoji(result.emotion || '🎵');

        await saveDiary({
          userId: currentUser.username,
          date,
          text: summary,
          songs: result.songs,
          emotion: result.emotion,
        });
      } else {
        setDiaryText('(변환 실패)');
      }
    } catch (err) {
      console.error('오류:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleManualSave() {
    try {
      Keyboard.dismiss();

      if (!diaryText.trim()) {
        Alert.alert('알림', '내용이 없습니다.');
        return;
      }

      await saveDiary({
        userId: currentUser.username,
        date,
        text: diaryText,
        songs: recommendedSongs,
        emotion: emotionEmoji,
      });

      Alert.alert('저장 완료', '일기가 저장되었습니다.');
    } catch (err) {
      Alert.alert('오류', '저장 중 문제가 발생했습니다.');
      console.error(err);
    }
  }

  async function handleDelete() {
    Alert.alert('일기 삭제', '일기를 삭제하시겠습니까?', [
      {
        text: '아니요',
        style: 'cancel',
      },
      {
        text: '네',
        onPress: async () => {
          try {
            await deleteDiary({ userId: currentUser.username, date });
            Alert.alert('삭제 완료', '일기가 삭제되었습니다.');
            navigation.navigate('Home');
          } catch (err) {
            Alert.alert('오류', '삭제 중 문제가 발생했습니다.');
            console.error(err);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: color }]}> 
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.dateText}>{date}</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.iconButton} onPress={handleManualSave}>
              <MaterialIcons name="save" size={28} color={textColor} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
              <MaterialIcons name="delete" size={28} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.textContainer}>
          <TextInput
            style={styles.textInput}
            multiline
            value={diaryText}
            onChangeText={setDiaryText}
            placeholder="오늘의 일기를 작성하세요."
            placeholderTextColor="#999"
          />
        </View>

        {recommendedSongs.length > 0 && (
          <View style={styles.songList}>
            <Text style={styles.songTitle}>{emotionEmoji} 오늘 하루에 어울리는 노래</Text>
            {recommendedSongs.map((song, idx) => (
              <Text key={idx} style={styles.songItem}>{song}</Text>
            ))}
          </View>
        )}

        <View style={styles.recordingContainer}>
          {recording ? (
            <TouchableOpacity
              style={styles.recordingButton}
              onPress={stopRecording}
              disabled={isLoading}
            >
              <MaterialIcons name="stop" size={30} color={textColor} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.recordingButton}
              onPress={startRecording}
              disabled={isLoading}
            >
              <MaterialIcons name="mic" size={30} color={textColor} />
            </TouchableOpacity>
          )}
          {isLoading && (
            <Text style={styles.loadingText}>처리 중입니다...</Text>
          )}
        </View>

        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
          <MaterialIcons name="arrow-back" size={28} color={textColor} />
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
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: screenHeight * 0.8,
  },
  headerRow: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  dateText: {
    fontSize: 22,
    color: textColor,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 4,
    marginLeft: 10,
  },
  textContainer: {
    flex: 1,
    marginTop: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    color: textColor,
    textAlignVertical: 'top',
  },
  songList: {
    marginTop: 10,
    marginBottom: 10,
  },
  songTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: textColor,
    marginBottom: 4,
  },
  songItem: {
    fontSize: 15,
    color: textColor,
    marginBottom: 2,
  },
  recordingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  recordingButton: {
    width: 70,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    color: textColor,
    fontSize: 14,
  },
  homeButton: {
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
});
