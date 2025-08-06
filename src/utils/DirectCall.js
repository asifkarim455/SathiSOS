import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

const { DirectCallModule } = NativeModules;

export const requestCallPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CALL_PHONE
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

export const makeDirectCall = async (phoneNumber) => {
  const granted = await requestCallPermission();
  if (granted) {
    DirectCallModule.makeDirectCall(phoneNumber);
  } else {
    console.warn('CALL_PHONE permission denied');
  }
};
