# 🎙 Voice Diary App

모바일 환경에서 **음성 일기 작성·관리**가 가능한 React Native 기반 일기 앱입니다.
음성으로 하루를 이야기하면 clova api를 통해 텍스트화 하고 openAI api를 통해 요약합니다.
Firebase를 백엔드로 사용하여 사용자별 일기 저장, 불러오기, 감정 이모지 표시 등의 기능을 제공합니다.

---

## 📱 주요 기능

- 📌 **회원 인증**
  - 이메일/비밀번호 기반 로그인 & 회원가입
- ✍️ **음성 기반 일기 작성**
- 📄 **일기 목록 관리**
  - 날짜 순으로 일기 리스트 표시
  - 일기 텍스트 미리보기 + 감정 이모지 표시
- 🔍 **과거 일기 보기**
- 🎨 **테마/색상 Context 기반 UI 지원**

---

## 🛠 기술 스택

- **React Native (Expo)**
- **Firebase**
  - Firestore (일기 데이터 저장)
  - Authentication
- **React Navigation**
- **AsyncStorage**
- **Vector Icons**
- **Dayjs** (날짜 처리)
- **Picker Component**
- **expo-av**
- **expo-file-system**

---

## 📁 프로젝트 구조

Voice_Diary_App
- assets/          : 정적 리소스
- contexts/        : Auth / Color Context 관리
- firebase/        : Firebase 설정
- screens/         : 주요 화면 컴포넌트
- utils/           : 기능 유틸 함수
- App.js           : 앱 진입점 및 Navigation 설정

---

## 🚀 설치 및 실행

1. 의존성 설치
   npm install
   또는
   yarn install

2. Expo 실행
   npm start

3. 플랫폼 실행
   Android : npm run android
   iOS     : npm run ios
   Web     : npm run web

---

## ⚙️ 주요 라이브러리

- @react-navigation/native
- @react-navigation/native-stack
- @react-native-async-storage/async-storage
- react-native-calendars
- firebase
- expo-av
- expo-file-system

---

## 🔐 Firebase

Firebase Firestore를 사용하여 각 사용자별 일기를 저장하며,
사용자 계정 정보를 기반으로 일기 데이터를 조회합니다.

---

## 📌 화면 구성

| 화면 | 설명 |
|------|------|
| 로그인 / 회원가입 | 사용자 인증 처리 |
| 홈 | 오늘 날짜의 일기 작성 |
| 일기 목록 | 작성된 일기 날짜별 표시 |
| 일기 상세 | 해당 날짜 일기 확인 |
| 감정 통계 | 감정별 통계 보기 |

---

## 🧠 특징

- Expo 기반 빠른 개발
- Firebase 연동으로 실시간 데이터 관리
- React Context 기반 인증 및 테마 상태 관리

---

## 📄 License

MIT License
