// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import DiaryScreen from './screens/DiaryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: '일기 앱 홈' }}
        />
        <Stack.Screen
          name="Diary"
          component={DiaryScreen}
          options={{ title: '일기 작성' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}