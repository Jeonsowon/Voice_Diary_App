import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 회원가입
  const signup = async ({ name, birthDate, username, password }) => {
    const userRef = collection(db, 'users');

    // 동일 아이디 확인
    const q = query(userRef, where('username', '==', username));
    const existing = await getDocs(q);
    if (!existing.empty) {
      throw new Error('이미 존재하는 아이디입니다.');
    }

    // 사용자 추가
    await addDoc(userRef, {
      name,
      birthDate,
      username,
      password,
      createdAt: new Date(),
    });
  };

  // 앱 시작 시 자동 로그인 체크
  useEffect(() => {
    const restoreSession = async () => {
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      }
    };
    restoreSession();
  }, []);

  // 로그인
  const login = async ({ username, password }) => {
    const q = query(
      collection(db, 'users'),
      where('username', '==', username),
      where('password', '==', password)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      setIsLoggedIn(true);
      setCurrentUser(userData);
      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));  
      return true;
    } else {
      return false;
    }
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    await AsyncStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return useContext(AuthContext);
} 