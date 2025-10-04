import {
  NativeModules,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { SmsModule } = NativeModules;
const PENDING_SMS_KEY = 'pendingSmsQueue';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function normalizeNumber(n) {
  if (!n) return null;
  return n.toString().replace(/[^+\d]/g, '');
}

async function ensureSmsPermission() {
  if (Platform.OS !== 'android') return false;

  try {
    const has = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.SEND_SMS);
    if (has) return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.SEND_SMS,
      {
        title: 'SMS Permission',
        message: 'App needs access to send SMS messages automatically.',
        buttonPositive: 'OK',
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('SMS permission check failed', err);
    return false;
  }
}

async function sendSmsOnce(to, message) {
  // Wrap native call to centralize error handling
  return await SmsModule.sendSms(to, message);
}

async function savePendingSms(toArray, message, lastError) {
  try {
    const existing = await AsyncStorage.getItem(PENDING_SMS_KEY);
    const queue = existing ? JSON.parse(existing) : [];
    const timestamp = Date.now();
    for (const t of toArray) {
      queue.push({ to: t, message, attempts: 0, lastError, timestamp });
    }
    await AsyncStorage.setItem(PENDING_SMS_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('Failed to persist pending SMS', err);
  }
}

export async function sendSilentSms(to, message, options = {}) {
  // options: { allowFallback: boolean, maxRetries: number }
  if (Platform.OS !== 'android') {
    Alert.alert('Unsupported', 'Silent SMS is only supported on Android');
    return false;
  }

  const recipients = Array.isArray(to) ? to : [to];
  const allowFallback = options.allowFallback !== undefined ? options.allowFallback : true;
  const maxRetries = options.maxRetries || 3;

  const hasPermission = await ensureSmsPermission();
  if (!hasPermission) {
    if (allowFallback) {
      // persist for retry later
      await savePendingSms(recipients.map(normalizeNumber).filter(Boolean), message, 'permission_denied');
    }
    Alert.alert('Permission Denied', 'Cannot send SMS without permission. Please grant SMS permission.');
    return false;
  }

  let allSent = true;

  for (const raw of recipients) {
    const number = normalizeNumber(raw);
    if (!number) {
      console.warn('Invalid recipient number, skipping:', raw);
      allSent = false;
      continue;
    }

    let sent = false;
    let attempt = 0;

    while (attempt < maxRetries && !sent) {
      attempt += 1;
      try {
        const result = await sendSmsOnce(number, message);
        // Native module may return different shapes; accept boolean true or { success: true }
        const ok = result === true || (result && result.success === true) || (!result || !result.error);
        if (ok) {
          sent = true;
          console.log('SMS sent to', number, result);
        } else {
          throw new Error(result && result.error ? result.error : 'Unknown SMS failure');
        }
      } catch (err) {
        console.warn(`SMS attempt ${attempt} failed for ${number}:`, err.message || err);
        if (attempt < maxRetries) {
          // backoff before retrying
          await sleep(300 * attempt);
        } else {
          allSent = false;
          if (allowFallback) {
            await savePendingSms([number], message, err.message || String(err));
          }
        }
      }
    }
  }

  return allSent;
}

export async function processPendingSmsQueue() {
  if (Platform.OS !== 'android') return;

  try {
    const existing = await AsyncStorage.getItem(PENDING_SMS_KEY);
    if (!existing) return;
    let queue = JSON.parse(existing);
    if (!Array.isArray(queue) || queue.length === 0) return;

    const newQueue = [];

    for (const item of queue) {
      const to = normalizeNumber(item.to);
      if (!to) continue;

      // drop messages that have been retried too many times
      const attempts = typeof item.attempts === 'number' ? item.attempts : 0;
      if (attempts >= 5) {
        console.warn('Dropping pending SMS after too many attempts:', to);
        continue;
      }

      try {
        const sent = await sendSilentSms(to, item.message, { allowFallback: false, maxRetries: 2 });
        if (!sent) {
          item.attempts = attempts + 1;
          item.lastAttempt = Date.now();
          newQueue.push(item);
        }
      } catch (err) {
        item.attempts = attempts + 1;
        item.lastError = err.message || String(err);
        item.lastAttempt = Date.now();
        newQueue.push(item);
      }
    }

    await AsyncStorage.setItem(PENDING_SMS_KEY, JSON.stringify(newQueue));
  } catch (err) {
    console.warn('Failed to process pending SMS queue', err);
  }
}
