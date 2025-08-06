import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { View, ActivityIndicator, StatusBar } from 'react-native';

import SplashScreen from '../screens/SplashScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import { AppTheme } from '../constant/theme';
import { AuthContext } from '../context/AuthContext';
import Toast from 'react-native-toast-message';
import NoInternetBanner from '../components/NoInternetBanner';

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  const { userData, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={AppTheme.colors.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={AppTheme}>
      <BottomSheetModalProvider>
        <NavigationContainer theme={AppTheme}>
          <StatusBar barStyle="dark-content" backgroundColor={AppTheme.colors.background} />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
          </Stack.Navigator>
          <NoInternetBanner />
          <Toast />
        </NavigationContainer>
      </BottomSheetModalProvider>
    </PaperProvider>
  );
};

export default AppNavigation;
