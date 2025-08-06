import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkProvider';

const App = () => {
  return (
    <AuthProvider>
      <NetworkProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppNavigator />
          <Toast />
        </GestureHandlerRootView>
      </NetworkProvider>
    </AuthProvider>
  );
};

export default App;
