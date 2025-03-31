import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { transcribeAudio } from '../utils/transcribeAudio';

export default function DiaryScreen() {
  const [recording, setRecording] = useState(null);
  const [recordedURI, setRecordedURI] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 녹음 시작
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

  // 녹음 중지 및 Clova 전송
  async function stopRecording() {
    try {
      if (!recording) return;

      setIsProcessing(true);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedURI(uri);
      setRecording(null);
      console.log('녹음 파일 저장됨:', uri);

      const response = await transcribeAudio(uri);

      if (response && response.text) {
        setTranscript(response.text);
      } else {
        setTranscript('(인식 결과 없음)');
      }

    } catch (err) {
      console.error('녹음 중지 에러:', err);
      setTranscript('(에러 발생)');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎙️ 음성 일기 녹음</Text>

      {recording === null ? (
        <Button title="녹음 시작" onPress={startRecording} disabled={isProcessing} />
      ) : (
        <Button title="녹음 중지 및 텍스트 변환" onPress={stopRecording} disabled={isProcessing} />
      )}

      {isProcessing && (
        <Text style={styles.processing}>🌀 변환 중입니다...</Text>
      )}

      {transcript !== '' && !isProcessing && (
        <Text style={styles.transcript}>📝 변환 결과:{"\n"}{transcript}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  processing: {
    marginTop: 20,
    fontSize: 16,
    color: 'orange',
    textAlign: 'center',
  },
  transcript: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});