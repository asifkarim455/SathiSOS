// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appVersion, setAppVersion] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      await loadUser();
      const version = await DeviceInfo.getVersion(); // e.g., "1.0.2"
      setAppVersion(version);
    };

    initialize();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('userProfile');
      if (storedUser) setUserData(JSON.parse(storedUser));
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async data => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(data));
      setUserData(data);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userProfile');
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ userData, loading, registerUser, logout, appVersion }}
    >
      {children}
    </AuthContext.Provider>
  );
};
