// src/components/NoInternetBanner.js
import React, { useContext, useEffect, useState } from 'react';
import { Icon, Snackbar } from 'react-native-paper';
import { NetworkContext } from '../context/NetworkProvider';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

const NoInternetBanner = () => {
    const { isConnected } = useContext(NetworkContext);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!isConnected) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [isConnected]);

    return (
        <Snackbar
            visible={visible}
            onDismiss={() => { }}
            duration={Snackbar.DURATION_MEDIUM}
            style={{
                backgroundColor: '#d32f2f',
                margin: 16,
                borderRadius: 6,
            }}
        >
            <View style={styles.content}>
                <Icon source="wifi-off" size={20} color="#fff" style={styles.icon} />
                <Text style={styles.text}>No Internet Connection</Text>
            </View>
        </Snackbar>
    );
};

const styles = StyleSheet.create({
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
    },
    text: {
        color: '#fff',
        fontWeight: '500',
        marginLeft: 8,
    },
});

export default NoInternetBanner;
