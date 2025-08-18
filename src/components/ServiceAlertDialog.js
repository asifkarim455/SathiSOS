// src/components/ServiceAlertDialog.js
import React from 'react';
import { Portal, Dialog, Button, Text } from 'react-native-paper';

const ServiceAlertDialog = ({ visible, title, message, onDismiss, onAction, actionLabel = 'Enable' }) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} dismissable={false}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text>{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button mode="contained" onPress={onAction}>{actionLabel}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ServiceAlertDialog;
