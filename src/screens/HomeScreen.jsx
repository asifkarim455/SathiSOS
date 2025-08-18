import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    Alert,
    ScrollView,
    Animated,
    Linking,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendSilentSms } from '../utils/SmsSender';
import { getCurrentLocation } from '../utils/location';
import { makeDirectCall } from '../utils/DirectCall';
import { requestSmsAppRole } from '../utils/SmsPermission';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCheckServices } from '../utils/useCheckServices';
import ServiceAlertDialog from '../components/ServiceAlertDialog';


const options = [
    {
        label: 'Pregnancy',
        bengali: 'গর্ভাবস্থা',
        icon: require('../assets/prenatal-care.png'),
        color: '#f59e0b',
        template: 'Hurry! {name}, facing pregnancy issue. Please reach out. Guardian: {parentMobile}, Location: {locationUrl} - Sathi App',
    },
    {
        label: 'Eve-Teasing',
        bengali: 'নারী উত্ত্যক্তকরণ',
        icon: require('../assets/sign.png'),
        color: '#ef4444',
        template: 'Urgent! {name} is experiencing eve-teasing. Guardian: {parentMobile}, Location: {locationUrl} - Sathi App',
    },
    {
        label: 'Accident',
        bengali: 'দুর্ঘটনা',
        icon: require('../assets/accident.png'),
        color: '#3b82f6',
        template: 'Emergency! {name} met with an accident. Immediate help needed. Guardian: {parentMobile}, Location: {locationUrl} - Sathi App',
    },
    {
        label: 'Other',
        bengali: 'অন্যান্য',
        icon: require('../assets/emergency.png'),
        color: '#10b981',
        template: 'Help! {name} has an emergency. Guardian: {parentMobile}, Location: {locationUrl} - Sathi App',
    },
];


const HomeScreen = () => {
    const theme = useTheme();
    const {
        internetEnabled,
        locationEnabled,
        checkingLocation,
        checkAndRequestLocation,
    } = useCheckServices();

    const { appVersion } = useContext(AuthContext);
    const [userData, setUserData] = useState('');

    const [showInternetDialog, setShowInternetDialog] = useState(false);
    const [showLocationDialog, setShowLocationDialog] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem('userProfile');
                if (userData) {
                    const data = JSON.parse(userData);
                    console.log("officer data: ", data)
                    setUserData(data);
                }
            } catch (err) {
                Alert.alert('Error', 'Failed to load user data');
            }
        };

        fetchUserData();
    }, []);

    React.useEffect(() => {
        if (!internetEnabled) setShowInternetDialog(true);
        else setShowInternetDialog(false);
    }, [internetEnabled]);

    // Show/hide location dialog based on real-time location status
    React.useEffect(() => {
        if (!locationEnabled) setShowLocationDialog(true);
        else setShowLocationDialog(false);
    }, [locationEnabled]);

    // Location enable retry action for dialog button
    const onEnableLocation = useCallback(async () => {
        setShowLocationDialog(false);
        try {
            await checkAndRequestLocation();
        } catch {
            // Handle error if needed
        }
    }, [checkAndRequestLocation]);

    // Internet enable action: open device settings
    const onEnableInternet = useCallback(() => {
        setShowInternetDialog(false);
        Linking.openSettings();
    }, []);

    const handlePress = async (label) => {
        try {
            if (!userData?.parentMobile || !userData?.name) {
                Alert.alert('Missing Info', 'User name or parent contact missing');
                return;
            }

            const selectedOption = options.find(o => o.label === label);
            if (!selectedOption) {
                Alert.alert('Error', 'Invalid emergency type selected');
                return;
            }

            const { latitude, longitude } = await getCurrentLocation();
            const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

            // Full message for officers
            const officerMessage = selectedOption.template
                .replace('{name}', userData.name)
                .replace('{parentMobile}', userData.parentMobile)
                .replace('{locationUrl}', locationUrl);

            // For parent: remove "Guardian: ..." from template before replacing
            const parentTemplate = selectedOption.template.replace(/Guardian:\s*\{parentMobile\},?\s*/g, '');
            const parentMessage = parentTemplate
                .replace('{name}', userData.name)
                .replace('{locationUrl}', locationUrl);

            await requestSmsAppRole();

            // Send to parent
            await sendSilentSms(userData.parentMobile, parentMessage);

            // Send to all officers (except parent)
            const officersJson = await AsyncStorage.getItem('officers');
            if (officersJson) {
                const officers = JSON.parse(officersJson);
                const officerNumbers = officers
                    .filter(o => o?.officerNumber && o.officerNumber !== userData.parentMobile)
                    .map(o => o.officerNumber);

                for (const number of officerNumbers) {
                    await sendSilentSms(number, officerMessage);
                }
            }

            setTimeout(() => {
                makeDirectCall(userData.parentMobile);
            }, 1000);
        } catch (err) {
            Alert.alert('Error', err.message || 'Something went wrong');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={{ flex: 1 }}>
                <View style={styles.header}>
                    <Image
                        source={require('../assets/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>সাথী</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollArea}>
                    <View style={[styles.grid, { borderRadius: 12 }]}>
                        {options.map((item, idx) => {

                            const scaleAnim = new Animated.Value(1); // declare inside map

                            const onPressIn = () => {
                                Animated.spring(scaleAnim, {
                                    toValue: 0.97,
                                    useNativeDriver: true,
                                }).start();
                            };

                            const onPressOut = () => {
                                Animated.spring(scaleAnim, {
                                    toValue: 1,
                                    friction: 3,
                                    tension: 40,
                                    useNativeDriver: true,
                                }).start();
                            };
                            return (
                                <Animated.View
                                    style={{ transform: [{ scale: scaleAnim }] }}
                                    key={idx}>
                                    <TouchableOpacity
                                        key={idx}
                                        style={[styles.card, { backgroundColor: item.color }]}
                                        onPressIn={onPressIn}
                                        onPressOut={onPressOut}
                                        activeOpacity={0.7}
                                        onPress={() => handlePress(item.label)}
                                    >
                                        <View style={styles.iconWrapper}>
                                            <Image
                                                source={item.icon}
                                                style={styles.icon}
                                                resizeMode="contain"
                                            />
                                        </View>
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.label}>{item.label}</Text>
                                            <Text style={styles.bengaliLabel}>{item.bengali}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            )
                        })}
                    </View>

                </ScrollView>
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>App Version- {appVersion}</Text>
                </View>
            </View>

            {/* Internet Alert Dialog */}
            <ServiceAlertDialog
                visible={showInternetDialog}
                title="Internet Required"
                message="Please enable Wi-Fi or Mobile Data to continue using the app."
                onDismiss={() => setShowInternetDialog(false)}
                onAction={onEnableInternet}
                actionLabel="Open Settings"
            />

            {/* Location Alert Dialog */}
            <ServiceAlertDialog
                visible={showLocationDialog}
                title="Location Required"
                message="Please enable location services to continue using the app."
                onDismiss={() => setShowLocationDialog(false)}
                onAction={onEnableLocation}
                actionLabel="Enable Location"
            />
        </SafeAreaView>
    );
};

export default HomeScreen;

const BOX_SIZE = (Dimensions.get('window').width - 64) / 2;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    logo: {
        width: 50,
        height: 50,
        marginRight: 10,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1f2937',
    },
    scrollArea: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        borderRadius: 12,
        justifyContent: 'space-between',
        rowGap: 24,
    },
    card: {
        width: BOX_SIZE,
        height: BOX_SIZE,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        padding: 12,
    },
    iconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    icon: {
        width: 36,
        height: 36,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    bengaliLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#fff',
        marginTop: 2,
        fontFamily: 'System', // you can replace with a Bengali font like 'NotoSansBengali' if available
    },
    versionContainer: {
        alignItems: 'center',
        marginTop: 12,
        paddingBottom: 20,
        borderTopColor: '#e5e7eb',
        borderTopWidth: 1,
    },

    versionText: {
        fontSize: 12,
        color: '#6b7280', // neutral gray
        fontWeight: '500',
    },

});
