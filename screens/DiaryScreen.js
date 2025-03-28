// app/diary.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

export default function DiaryScreen() {
  const [recording, setRecording] = useState(null);
  const [recordedURI, setRecordedURI] = useState(null);

  async function startRecording() {
    try {
      // 마이크 권한 요청
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('마이크 권한이 필요합니다.');
        return;
      }
      
      // 녹음 모드 설정
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      console.log('녹음 시작합니다...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      console.log('녹음 중...');
    } catch (err) {
      console.error('녹음 시작 에러:', err);
    }
  }

  async function stopRecording() {
    try {
      if (!recording) return;
      console.log('녹음 중지 중...');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedURI(uri);
      setRecording(null);
      console.log('녹음 파일 저장됨:', uri);
    } catch (err) {
      console.error('녹음 중지 에러:', err);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>일기 녹음</Text>
      {recording === null ? (
        <Button title="녹음 시작" onPress={startRecording} />
      ) : (
        <Button title="녹음 중지" onPress={stopRecording} />
      )}
      {recordedURI && (
        <Text style={styles.info}>녹음 파일 위치: {recordedURI}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20 
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20 
  },
  info: { 
    marginTop: 20, 
    fontSize: 16 
  },
});