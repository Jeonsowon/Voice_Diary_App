// 📁 contexts/ColorContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ColorContext = createContext();

export function ColorProvider({ children }) {
  const [color, setColor] = useState('#FAFAFA');

  useEffect(() => {
    AsyncStorage.getItem('selectedColor').then(stored => {
      if (stored) setColor(stored);
    });
  }, []);

  const changeColor = async (newColor) => {
    setColor(newColor);
    await AsyncStorage.setItem('selectedColor', newColor);
  };

  return (
    <ColorContext.Provider value={{ color, changeColor }}>
      {children}
    </ColorContext.Provider>
  );
}

export const useColor = () => useContext(ColorContext);
