import * as FileSystem from 'expo-file-system';
import { CLOVA_API_KEY, CLOVA_API_URL } from '@env';

export async function transcribeAudio(uri) {
  try {
    const result = await FileSystem.uploadAsync(CLOVA_API_URL, uri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'media',
      parameters: {
        params: JSON.stringify({
          language: 'ko-KR',
          completion: 'sync',
          fullText: true,
          diarization: {
            enable: false
          }
        }),
      },
      headers: {
        'X-CLOVASPEECH-API-KEY': CLOVA_API_KEY,
        'Accept': 'application/json',
      },
    });

    const jsonResponse = JSON.parse(result.body);
    console.log('Clova API 응답:', jsonResponse);
    return jsonResponse;
  } catch (error) {
    console.error('Clova API 호출 에러:', error);
    throw error;
  }
}