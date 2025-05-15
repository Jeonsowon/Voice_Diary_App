// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import DiaryScreen from './screens/DiaryScreen';
import DiaryListScreen from './screens/DiaryListScreen';
import PastDiaryListScreen from './screens/PastDiaryListScreen';
import { ColorProvider } from './contexts/ColorContext';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Diary" component={DiaryScreen} />
          <Stack.Screen name="DiaryList" component={DiaryListScreen} />
          <Stack.Screen name="PastDiaryList" component={PastDiaryListScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ColorProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Main" component={Navigation} />
          </Stack.Navigator>
        </NavigationContainer>
      </ColorProvider>
    </AuthProvider>
  );
}