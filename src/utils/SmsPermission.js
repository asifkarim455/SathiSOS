import { NativeModules, Platform, Alert } from 'react-native';

const { SmsHelper } = NativeModules;

export async function requestSmsAppRole() {
  if (Platform.OS !== 'android') {
    Alert.alert('Unsupported', 'Only supported on Android');
    return;
  }

  try {
    const result = await SmsHelper.requestDefaultSmsApp();
    console.log('SMS role requested:', result);
    Alert.alert('Requested', 'Please confirm the role in the system dialog.');
  } catch (err) {
    console.error('SMS Role Error:', err);
    Alert.alert('Error', err.message || 'Failed to request SMS role');
  }
}
