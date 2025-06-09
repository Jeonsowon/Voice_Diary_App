// 파일: utils/diaryService.js
import { collection, query, where, getDoc, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// 일기 저장
export async function saveDiary({ userId, date, text, songs = [], emotion, keywords }) {
  try {
    const docId = `${userId}_${date}`;
    const ref = doc(db, 'diaries', docId);

    await setDoc(ref, {
      userId,
      date,
      text,
      songs,
      emotion,
      keywords,
      updatedAt: new Date(),
    });

    console.log('일기 저장 성공', docId);
  } catch (error) {
    console.error('일기 저장 실패:', error);
    throw error;
  }
}

// 일기 조회
export async function fetchDiary({ userId, date }) {
  try {
    const docId = `${userId}_${date}`;
    const ref = doc(db, 'diaries', docId);
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
      return snapshot.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('일기 불러오기 실패:', error);
    return null;
  }
}

// 일기 삭제
export async function deleteDiary({ userId, date }) {
  try {
    const ref = collection(db, 'diaries');
    const q = query(ref, where('userId', '==', userId), where('date', '==', date));
    const snapshot = await getDocs(q);

    for (const document of snapshot.docs) {
      await deleteDoc(doc(db, 'diaries', document.id));
    }
  } catch (error) {
    console.error('일기 삭제 실패:', error);
    throw error;
  }
}
  