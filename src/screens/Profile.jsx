import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
    ActivityIndicator,
    Avatar,
    Divider,
    IconButton,
    List,
    Text,
    TextInput,
    useTheme,
    Button,
    HelperText,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const Profile = () => {
    const theme = useTheme();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Editable field: parent contact
    const [parentContact, setParentContact] = useState('');
    const [saving, setSaving] = useState(false);
    const [touched, setTouched] = useState(false);

    const loadProfile = useCallback(async () => {
        try {
            const userData = await AsyncStorage.getItem('userProfile');
            if (userData) {
                const data = JSON.parse(userData);
                setProfile(data);
                setParentContact(String(data?.parentMobile || ''));
            } else {
                setProfile(null);
            }
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Failed to load profile' });
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    // Simple phone validation: 10-15 digits. Adjust to your locale if needed.
    const phoneError = useMemo(() => {
        if (!touched) return '';
        const trimmed = parentContact.trim();
        if (!trimmed) return 'Parent contact is required';
        if (!/^\d{10,15}$/.test(trimmed)) return 'Enter a valid contact number (10-15 digits)';
        return '';
    }, [parentContact, touched]);

    const onSaveParentContact = useCallback(async () => {
        setTouched(true);
        if (phoneError) {
            Toast.show({ type: 'error', text1: 'Invalid number', text2: phoneError });
            return;
        }
        if (!profile) {
            Toast.show({ type: 'error', text1: 'No profile to update' });
            return;
        }

        try {
            setSaving(true);
            const updated = { ...profile, parentMobile: parentContact.trim() };

            // Persist to AsyncStorage
            await AsyncStorage.setItem('userProfile', JSON.stringify(updated));
            setProfile(updated);

            Toast.show({ type: 'success', text1: 'Parent contact updated' });
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Failed to save changes' });
        } finally {
            setSaving(false);
        }
    }, [phoneError, parentContact, profile]);

    const initials = (profile?.name || 'User')
        .split(' ')
        .map(part => part[0]?.toUpperCase())
        .slice(0, 2)
        .join('');

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator animating color={theme.colors.primary} />
                <Text style={{ marginTop: 10 }}>Loading profile…</Text>
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={[styles.center, { padding: 16, backgroundColor: theme.colors.background }]}>
                <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                    No profile found
                </Text>
                <Text style={{ marginBottom: 16, color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                    Please ensure you are logged in and try again.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={{ paddingTop: 40, backgroundColor: theme.colors.background }}
            contentContainerStyle={{ padding: 16 }}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.header}>
                <Avatar.Text size={64} label={initials || 'U'} style={{ backgroundColor: theme.colors.primary }} />
                <View style={styles.headerText}>
                    <Text variant="headlineSmall" style={styles.name}>
                        {profile.name || '-'}
                    </Text>
                    <Text style={{ color: theme.colors.onSurfaceVariant }}>
                        Area Code: {profile.areaCode || '-'}
                    </Text>
                </View>
            </View>

            <Divider style={{ marginVertical: 16 }} />

            <List.Section>
                <List.Subheader>Account</List.Subheader>

                <List.Item
                    title="Name"
                    description={profile.name || '-'}
                    left={props => <List.Icon {...props} icon="account" />}
                />

                {/* Editable only for Emergency Contact */}
                <List.Item
                    title="Emergency Contact"
                    description={() => (
                        <View style={{ marginTop: 6 }}>
                            <TextInput
                                mode="outlined"
                                value={parentContact}
                                onChangeText={setParentContact}
                                keyboardType="phone-pad"
                                placeholder="Enter emergency contact"
                                outlineStyle={{ borderRadius: 10 }}
                                onBlur={() => setTouched(true)}
                                right={
                                    <TextInput.Icon
                                        icon="content-save"
                                        onPress={onSaveParentContact}
                                        disabled={saving}
                                    />
                                }
                            />
                            {!!phoneError && <HelperText type="error">{phoneError}</HelperText>}
                            {/* <Button
                                mode="contained"
                                style={{ marginTop: 8, alignSelf: 'flex-start' }}
                                onPress={onSaveParentContact}
                                loading={saving}
                                disabled={saving}
                                icon="content-save"
                            >
                                Save
                            </Button> */}
                        </View>
                    )}
                    left={props => <List.Icon {...props} icon="phone" />}
                />

                {/* Read-only fields below */}
                <List.Item
                    title="Area Code"
                    description={profile.areaCode || '-'}
                    left={props => <List.Icon {...props} icon="map-marker" />}
                />

                <List.Item
                    title="Admin Registration Code"
                    description={profile.username || '-'}
                    left={props => <List.Icon {...props} icon="identifier" />}

                />

                <List.Item
                    title="Admin ID"
                    description={profile.adminId || '-'}
                    left={props => <List.Icon {...props} icon="shield-account" />}

                />
            </List.Section>
        </ScrollView>
    );
};

export default Profile;

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: { flexDirection: 'row', alignItems: 'center' },
    headerText: { marginLeft: 12, flex: 1 },
    name: { fontWeight: '700' },
});
