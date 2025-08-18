import React from 'react';
import Modal from 'react-native-modal';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';

const CustomModal = ({ visible, onClose, title, children, showClose = true }) => {
    return (
        <Modal
            isVisible={visible}
            hasBackdrop={true}
            useNativeDriverForBackdrop={true}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            useNativeDriver={true}
            backdropOpacity={0.5}
            animationIn={"fadeIn"}
            animationInTiming={300}
            animationOut={"fadeOut"}
            animationOutTiming={300}
            backdropTransitionInTiming={300}
            backdropTransitionOutTiming={300}
            hideModalContentWhileAnimating
            style={styles.modal}
        >
            <View style={styles.container}>
                {title && <Text style={styles.title}>{title}</Text>}
                <View style={styles.content}>{children}</View>
                {showClose && (
                    <Button mode="contained" onPress={onClose} style={styles.closeBtn}>
                        Close
                    </Button>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'center',
        // margin: 0,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 4,
        // elevation: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    content: {
        marginBottom: 16,
    },
    closeBtn: {
        alignSelf: 'center',
        borderRadius: 8,
        marginTop: 8,
    },
});

export default CustomModal;
