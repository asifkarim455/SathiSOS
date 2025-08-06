// utils/location.js
import { Alert, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export const getCurrentLocation = () => {
  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
      },
    //   error => {
    //     console.log('GPS Error:', error);
    //     let message = 'Unknown error';
    //     switch (error.code) {
    //       case 1:
    //         message = 'Location permission denied.';
    //         break;
    //       case 2:
    //         message = 'Location unavailable. Please check your GPS.';
    //         break;
    //       case 3:
    //         message = 'Location request timed out. Try again outdoors.';
    //         break;
    //     }

    //     Alert.alert('Location Error', message);
    //     reject(new Error(message));
    //   },
    //   {
    //     enableHighAccuracy: true,
    //     timeout: 30000,
    //     maximumAge: 10000,
    //     forceRequestLocation: true,
    //     showLocationDialog: true,
    //   },
    );
  });
};
