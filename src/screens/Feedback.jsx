// screens/Feedback.js
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import {
    ActivityIndicator,
    Button,
    HelperText,
    Text,
    TextInput,
    useTheme,
    Snackbar,
} from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { apiCall } from '../utils/apiCall';
import Toast from 'react-native-toast-message';

const Feedback = () => {
    const theme = useTheme();
    const navigation = useNavigation();

    const [topics, setTopics] = useState([]); // [{label, value}]
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [selectedTopicId, setSelectedTopicId] = useState(null);
    const [message, setMessage] = useState('');
    const [touched, setTouched] = useState({ topic: false, message: false });
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ visible: false, text: '' });

    // User profile from storage
    const [profile, setProfile] = useState(null);

    const isTopicError = useMemo(() => touched.topic && !selectedTopicId, [touched.topic, selectedTopicId]);
    const isMessageError = useMemo(() => touched.message && message.trim().length < 5, [touched.message, message]);

    const loadTopics = useCallback(async () => {
        setLoading(true);
        setFetchError('');
        try {
            // Try to read adminId from stored user profile so we can fetch public topics for that admin
            const userData = await AsyncStorage.getItem('userProfile');
            const user = userData ? JSON.parse(userData) : null;
            const adminId = user?.adminId;

            if (!adminId) {
                setFetchError('Admin ID missing. Please complete your profile to load topics.');
                setTopics([]);
                setLoading(false);
                return;
            }

            // Call the public endpoint providing adminId as query param
            const res = await apiCall(`/api/user/feedback-topics/public?adminId=${encodeURIComponent(adminId)}`, 'GET');
            console.log(res);

            if (res?.success) {
                // Support both shapes: res.data.data or res.data
                const items = res?.data?.data ?? res?.data ?? [];
                const mapped = Array.isArray(items)
                    ? items.map(item => ({ label: item.title, value: item._id || item.id }))
                    : [];
                setTopics(mapped);
            } else {
                setFetchError('Failed to load topics');
            }
        } catch (e) {
            console.error('loadTopics error', e);
            setFetchError('Failed to load topics');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadProfile = useCallback(async () => {
        try {
            const userData = await AsyncStorage.getItem('userProfile');
            if (userData) {
                const data = JSON.parse(userData);
                setProfile(data);
            }
        } catch (e) {
            // Optional: surface error
        }
    }, []);

    useEffect(() => {
        loadTopics();
        loadProfile();
    }, [loadTopics, loadProfile]);

    const onSubmit = useCallback(async () => {
        setTouched({ topic: true, message: true });

        if (!selectedTopicId || message.trim().length < 5) {
            Toast.show({
                type: 'error',
                text1: 'Validation error',
                text2: !selectedTopicId
                    ? 'Please select a topic'
                    : 'Please enter at least 5 characters',
            });
            return;
        }

        // Guard: require profile fields
        const adminRegistrationCode = profile?.username; // "WPJHKX"
        const submitterName = profile?.name;             // e.g., "Asif"
        const submitterContact = profile?.parentMobile;  // e.g., "9874438318"

        if (!adminRegistrationCode || !submitterName || !submitterContact) {
            Toast.show({
                type: 'error',
                text1: 'Missing user details',
                text2: 'Please ensure profile is complete.',
            });
            return;
        }

        const payload = {
            adminRegistrationCode,
            topicId: selectedTopicId,
            message: message.trim(),
            submitterName,
            submitterContact,
        };

        try {
            setSubmitting(true);
            const res = await apiCall('/api/user/feedback', 'post', payload);
            if (!res.success || !res.data?.success) {
                throw new Error(res.error || 'Submit failed');
            }

            Toast.show({
                type: 'success',
                text1: 'Feedback submitted',
                text2: 'Thank you for your feedback.',
            });

            // Clear local form state
            setSelectedTopicId(null);
            setMessage('');
            setTouched({ topic: false, message: false });

            // Go back after a short delay to allow toast to appear
            setTimeout(() => {
                navigation.goBack();
            }, 800);
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: 'Submission failed',
                text2: err?.message || 'Failed to submit feedback',
            });
        } finally {
            setSubmitting(false);
        }
    }, [selectedTopicId, message, profile, navigation]);


    return (
        <KeyboardAvoidingView
            style={[styles.flex1, { backgroundColor: theme.colors.background }]}
            behavior={Platform.select({ ios: 'padding', android: undefined })}
        >
            <View style={styles.container}>
                <Text variant="headlineSmall" style={styles.title}>
                    Feedback
                </Text>

                {loading ? (
                    <View style={styles.loaderWrap}>
                        <ActivityIndicator animating color={theme.colors.primary} />
                        <Text style={styles.loaderText}>Loading topics…</Text>
                    </View>
                ) : fetchError ? (
                    <View style={styles.errorWrap}>
                        <Text style={{ color: theme.colors.error, marginBottom: 8 }}>{fetchError}</Text>
                        <Button mode="outlined" onPress={loadTopics} icon="reload">
                            Retry
                        </Button>
                    </View>
                ) : (
                    <>
                        <Text style={styles.label}>Topic</Text>
                        <Dropdown
                            style={[
                                styles.dropdown,
                                { borderColor: isTopicError ? theme.colors.error : theme.colors.primary },
                            ]}
                            containerStyle={[
                                styles.dropdownContainer,
                                { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary },
                            ]}
                            itemContainerStyle={{ marginVertical: 4 }}
                            itemTextStyle={{ color: theme.colors.onSurface }}
                            placeholderStyle={styles.placeholder}
                            selectedTextStyle={[styles.selectedText, { color: theme.colors.onSurface }]}
                            activeColor={theme.colors.primary}
                            showsVerticalScrollIndicator={false}
                            autoScroll
                            data={topics}
                            labelField="label"
                            valueField="value"
                            searchField="label"
                            maxHeight={350}
                            placeholder="Select Topic"
                            value={selectedTopicId}
                            onChange={item => {
                                setSelectedTopicId(item.value);
                            }}
                            renderEmpty={() => (
                                <Text style={{ textAlign: 'center', padding: 10, color: theme.colors.onSurfaceVariant }}>
                                    No matching topics found.
                                </Text>
                            )}
                            flatListProps={{
                                keyboardShouldPersistTaps: 'handled',
                            }}
                            onFocus={() => setTouched(prev => ({ ...prev, topic: true }))}
                        />
                        {isTopicError && <HelperText type="error">Please select a topic</HelperText>}

                        <Text style={styles.label}>Message</Text>
                        <TextInput
                            mode="outlined"
                            placeholder="Describe your feedback..."
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={6}
                            style={styles.textArea}
                            outlineStyle={{ borderRadius: 12 }}
                            onBlur={() => setTouched(prev => ({ ...prev, message: true }))}
                        />
                        {isMessageError && <HelperText type="error">Please enter at least 5 characters</HelperText>}

                        <Button
                            mode="contained"
                            onPress={onSubmit}
                            disabled={submitting}
                            loading={submitting}
                            style={styles.submitBtn}
                            icon="send"
                        >
                            Submit
                        </Button>
                    </>
                )}
            </View>

            <Snackbar
                visible={snackbar.visible}
                onDismiss={() => setSnackbar({ visible: false, text: '' })}
                duration={2200}
                action={{ label: 'OK', onPress: () => setSnackbar({ visible: false, text: '' }) }}
            >
                {snackbar.text}
            </Snackbar>
        </KeyboardAvoidingView>
    );
};

export default Feedback;

const styles = StyleSheet.create({
    flex1: { flex: 1 },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 40,
    },
    title: {
        marginBottom: 12,
        fontWeight: '700',
    },
    label: {
        marginTop: 12,
        marginBottom: 6,
        fontSize: 14,
        fontWeight: '600',
    },
    dropdown: {
        height: 50,
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
        justifyContent: 'center',
    },
    dropdownContainer: {
        borderRadius: 8,
        borderWidth: 1,
    },
    placeholder: {
        color: '#999',
        fontSize: 14,
    },
    selectedText: {
        color: '#000',
        fontWeight: 'bold',
    },
    textArea: {
        minHeight: 140,
        textAlignVertical: 'top',
    },
    submitBtn: {
        marginTop: 16,
        borderRadius: 10,
        paddingVertical: 4,
    },
    loaderWrap: {
        marginTop: 40,
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 10,
    },
    errorWrap: {
        marginTop: 20,
        alignItems: 'center',
    },
});
