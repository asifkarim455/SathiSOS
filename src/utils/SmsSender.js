import {
  NativeModules,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';

const { SmsModule } = NativeModules;

export async function sendSilentSms(to, message) {
  if (Platform.OS !== 'android') {
    Alert.alert('Unsupported', 'Silent SMS is only supported on Android');
    return;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.SEND_SMS,
    {
      title: 'SMS Permission',
      message: 'App needs access to send SMS messages automatically.',
      buttonPositive: 'OK',
    },
  );

  if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    Alert.alert('Permission Denied', 'Cannot send SMS without permission.');
    return;
  }

  try {
    const result = await SmsModule.sendSms(to, message);
    console.log('SMS result:', result);
    // Alert.alert('Success', 'Message sent successfully');
  } catch (err) {
    console.error('SMS Error:', err);
    Alert.alert('Error', err.message || 'Failed to send SMS');
  }
}
