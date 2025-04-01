// 📁 app/DiaryScreen.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { transcribeAudio } from '../utils/transcribeAudio';
import { summarizeText } from '../utils/summarizeText';

export default function DiaryScreen() {
  const [recording, setRecording] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        setTranscript(response.text);

        const summaryResult = await summarizeText(response.text);
        setSummary(summaryResult);
      } else {
        setTranscript('(변환 실패)');
      }
    } catch (err) {
      console.error('오류:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎙️ 음성 일기</Text>

      {recording ? (
        <Button title="🛑 녹음 중지 및 변환" onPress={stopRecording} disabled={isLoading} />
      ) : (
        <Button title="🎤 녹음 시작" onPress={startRecording} disabled={isLoading} />
      )}

      {isLoading && <Text style={styles.loading}>⏳ 처리 중입니다...</Text>}

      {transcript !== '' && (
        <>
          <Text style={styles.subtitle}>📝 인식된 내용</Text>
          <Text style={styles.block}>{transcript}</Text>
        </>
      )}

      {summary !== '' && (
        <>
          <Text style={styles.subtitle}>📌 요약</Text>
          <Text style={styles.block}>{summary}</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: 'bold'
  },
  block: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8
  },
  loading: {
    marginTop: 20,
    textAlign: 'center',
    color: 'orange'
  }
});