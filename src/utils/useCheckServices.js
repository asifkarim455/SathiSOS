// src/hooks/useCheckServices.js
import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import { Platform } from 'react-native';

export function useCheckServices() {
  const [internetEnabled, setInternetEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [checkingLocation, setCheckingLocation] = useState(true);

  // Real-time Internet connectivity listener
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setInternetEnabled(state.isConnected && state.isInternetReachable !== false);
    });
    return () => unsubscribeNetInfo();
  }, []);

  // Check location service on mount and expose a manual location re-check
  const checkAndRequestLocation = useCallback(async () => {
    setCheckingLocation(true);
    try {
      if (Platform.OS === 'android') {
        const status = await promptForEnableLocationIfNeeded({
          interval: 10000,
          fastInterval: 5000,
        });
        setLocationEnabled(status === 'enabled' || status === 'already-enabled');
      } else {
        // For iOS, you should check permission and location services separately,
        // here just assume true to avoid blocking UI
        setLocationEnabled(true);
      }
    } catch (error) {
      setLocationEnabled(false);
    }
    setCheckingLocation(false);
  }, []);

  // Run location check on mount
  useEffect(() => {
    checkAndRequestLocation();
  }, [checkAndRequestLocation]);

  return { internetEnabled, locationEnabled, checkingLocation, checkAndRequestLocation };
}
