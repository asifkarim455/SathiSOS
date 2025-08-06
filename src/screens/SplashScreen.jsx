import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Platform,
    PermissionsAndroid,
    TouchableOpacity,
    BackHandler,
    Alert,
    Linking,
    Image,
} from 'react-native';
import {
    check,
    request,
    openSettings,
    PERMISSIONS,
    RESULTS,
} from 'react-native-permissions';
import { useNavigation } from '@react-navigation/native';
import { Button, useTheme } from 'react-native-paper';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const SplashScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [checking, setChecking] = useState(true);
    const [blockedPermission, setBlockedPermission] = useState(null);
    const { userData, loading } = useContext(AuthContext);

    const REQUIRED_PERMISSIONS = [
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
        PERMISSIONS.ANDROID.READ_PHONE_STATE,
        PERMISSIONS.ANDROID.RECEIVE_SMS,
        PERMISSIONS.ANDROID.READ_SMS,
        PERMISSIONS.ANDROID.SEND_SMS,
        // PERMISSIONS.ANDROID.CALL_PHONE,
        Platform.Version >= 33 ? PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS : null,
    ].filter(Boolean); // Remove null if not on Android 13+

    const checkAndRequestPermissions = useCallback(async () => {
        setChecking(true);
        setBlockedPermission(null);

        let allGranted = true;
        let blocked = false;

        for (const perm of REQUIRED_PERMISSIONS) {
            const status = await check(perm);

            if (status === RESULTS.GRANTED) continue;

            const result = await request(perm);

            if (result === RESULTS.BLOCKED) {
                blocked = true;
                allGranted = false;
            } else if (result !== RESULTS.GRANTED) {
                allGranted = false;
            }
        }


        if (allGranted) {
            // After permissions are granted, navigate based on userData
            if (userData) {
                navigation.replace('Home');
            } else {
                navigation.replace('Register');
            }
        }

        setChecking(false);
    }, [navigation]);

    const forceOpenSettings = async () => {
        try {
            await Linking.openSettings(); // reliable settings handler
        } catch {
            Alert.alert('Error', 'Unable to open settings.');
        }
    };

    const exitApp = () => BackHandler.exitApp();

    useEffect(() => {
        checkAndRequestPermissions();
    }, [checkAndRequestPermissions]);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

            <Image
                source={require('../assets/icon.png')}
                style={{ width: 100, height: 100, marginBottom: 10, backgroundColor: 'black', borderRadius: 24, borderColor: theme.colors.primary, borderWidth: 2, }}
                resizeMode='cover'

            />

            <Text style={styles.title}>Sathi SOS</Text>

            {checking ? (
                <>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.subtext}>Checking permissions...</Text>
                </>
            ) : blockedPermission ? (
                <>
                    <Text style={[styles.error, { color: theme.colors.error }]}>
                        A required permission is permanently denied. Please enable it in Settings.
                    </Text>

                    <Button
                        mode="contained"
                        onPress={forceOpenSettings}
                        icon={'open-in-new'}
                    >
                        Open Settings
                    </Button>

                    <TouchableOpacity style={styles.exit} onPress={exitApp}>
                        <Text style={styles.exitText}>Exit App</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text style={[styles.error, { color: theme.colors.error }]}>
                        Some permissions were denied. Please allow them to continue.
                    </Text>
                    <View style={{ gap: 10 }}>
                        <Button
                            mode="contained"
                            onPress={checkAndRequestPermissions}
                            icon={'refresh'}
                        >
                            Retry Permissions
                        </Button>

                        <Button
                            mode="outlined"
                            onPress={forceOpenSettings}
                            icon={'open-in-new'}
                        >
                            Open Settings
                        </Button>
                    </View>


                    <TouchableOpacity activeOpacity={0.5} style={styles.exit} onPress={exitApp}>
                        <Text style={styles.exitText}>Exit App</Text>
                    </TouchableOpacity>
                </>
            )}
            <View style={{ position: 'absolute', bottom: 20, alignItems: 'center' }}>
                <Text style={{ fontStyle: 'italic' }}>Powered by <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline' }}
                    onPress={() => Linking.openURL('https://amptechnology.in/')}>AMP Technology</Text></Text>
            </View>
        </View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 30,
    },
    subtext: {
        fontSize: 16,
        marginTop: 10,
        color: '#6b7280',
    },
    error: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    // button: {
    //     backgroundColor: '#4f46e5',
    //     paddingVertical: 12,
    //     paddingHorizontal: 30,
    //     borderRadius: 8,
    //     marginTop: 10,
    //     elevation: 3,
    // },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    secondary: {
        backgroundColor: '#e0e7ff',
    },
    secondaryText: {
        color: '#3730a3',
    },
    exit: {
        marginTop: 16,
    },
    exitText: {
        color: '#9ca3af',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});
