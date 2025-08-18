import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import CustomModal from '../components/CustomModal';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import {
  TextInput,
  Button,
  Checkbox,
  Text,
  useTheme,
  List, Menu, Divider
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import Animated, { SlideInDown, SlideInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { apiCall } from '../utils/apiCall';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TERMS_AND_CONDITIONS } from '../constant/term';
import { PRIVACY_POLICY } from '../constant/privacy';


const RegisterScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [areaCode, setAreaCode] = useState('');
  const [agree, setAgree] = useState(false);
  const [username, setUsername] = useState('');
  const [fetchedAreas, setFetchedAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);




  const [modalVisible, setModalVisible] = useState(false);

  const { registerUser, appVersion } = useContext(AuthContext);

  const handleLoadAreas = async () => {
    if (!username.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter a username first.' });
      return;
    }

    setLoadingAreas(true);
    const res = await apiCall('/api/user/activeareas', 'post', { registrationCode: username.trim() });
    setLoadingAreas(false);

    if (res.success && res.data?.data?.areas?.length > 0) {
      setFetchedAreas(res.data.data.areas);
      Toast.show({ type: 'success', text1: 'Areas loaded successfully.' });
    } else {
      setFetchedAreas([]);
      Toast.show({
        type: 'error',
        text1: 'Failed to load areas',
        text2: res.error || 'No areas found.',
      });
    }
  };


  const handleRegister = async () => {
    if (!name || !parentMobile || !areaCode || !agree || !username) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'All fields including username must be filled.',
      });
      return;
    }

    const userData = {
      name,
      parentMobile,
      areaCode,
      username,
      adminId: fetchedAreas?.[0]?.adminId || null,
    };

    try {
      await registerUser(userData);

      const officerRes = await apiCall('/api/user/officers-by-area', 'post', {
        areaCode,
      });

      console.log("Officer Response:", officerRes);

      if (officerRes.success) {
        const officers = officerRes.data?.data?.officers || [];
        console.log("Saving officers to AsyncStorage:", officers);
        await AsyncStorage.setItem('officers', JSON.stringify(officers));
        Toast.show({ type: 'success', text1: 'Officer data saved.' });
      } else {
        Toast.show({
          type: 'info',
          text1: 'No officers found for this area.',
        });
      }

      // 🚨 Ensure this route is defined!
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });

      Toast.show({ type: 'success', text1: 'Registered Successfully' });

    } catch (err) {
      console.error("Registration crash error:", err);
      Toast.show({
        type: 'error',
        text1: 'Registration failed',
        text2: err?.message || 'Unexpected error occurred.',
      });
    }
  };




  return (
    <LinearGradient colors={['#3F72AF', '#DBE2EF', '#F9F7F7']} style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          // contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LottieView
            source={require('../assets/siren.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text
            variant="headlineMedium"
            style={[styles.title, { color: theme.colors.secondary }]}
          >
            Register
          </Text>

          <Animated.View entering={SlideInDown.duration(600)}>
            <View style={styles.formContainer}>
              <TextInput
                label="Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
                mode="outlined"
              />
              <TextInput
                label="Emergency Mobile Number"
                value={parentMobile}
                onChangeText={setParentMobile}
                keyboardType="phone-pad"
                style={styles.input}
                mode="outlined"
              />
              <TextInput
                label="Registration Code"
                value={username}
                onChangeText={(text) => setUsername(text.toUpperCase())}
                style={styles.input}
                mode="outlined"
              />

              <Button
                mode="contained"
                onPress={handleLoadAreas}
                loading={loadingAreas}
                disabled={!username}
                style={[styles.button, { marginBottom: 12 }]}
              >
                Load Areas
              </Button>

              {fetchedAreas.length > 0 && (
                <Dropdown
                  dropdownPosition="top"
                  style={[styles.dropdown, { borderColor: theme.colors.primary }]}
                  containerStyle={[
                    styles.dropdownContainer,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary },
                  ]}
                  itemContainerStyle={{ marginVertical: 4 }}
                  itemTextStyle={{ color: theme.colors.onSurface, }}
                  placeholderStyle={styles.placeholder}
                  selectedTextStyle={styles.selectedText}
                  activeColor={theme.colors.primary}
                  showsVerticalScrollIndicator={false}
                  autoScroll
                  // search
                  searchPlaceholder="Search area name or code"
                  data={fetchedAreas.map(area => ({
                    label: `${area.areaName} (${area.areaCode})`,
                    value: area.areaCode,
                    area: area,
                  }))}
                  labelField="label"
                  valueField="value"
                  searchField="label"
                  maxHeight={350}
                  placeholder="Select Area"
                  value={selectedArea?.areaCode}
                  onChange={item => {
                    setSelectedArea(item.area);
                    setAreaCode(item.area.areaCode);
                  }}
                  renderEmpty={() => (
                    <Text style={{ textAlign: 'center', padding: 10, color: theme.colors.onSurfaceVariant }}>
                      No matching areas found.
                    </Text>
                  )}
                  flatListProps={{
                    keyboardShouldPersistTaps: 'handled',
                  }}
                />


              )}

              <View style={styles.checkboxRow}>
                <Checkbox
                  status={agree ? 'checked' : 'unchecked'}
                  onPress={() => setAgree(!agree)}
                />
                <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>
                  I agree to the{' '}
                  <Text
                    style={{ textDecorationLine: 'underline', color: theme.colors.primary }}
                    onPress={() => setModalVisible(true)}
                  >
                    terms and conditions
                  </Text>
                  {' '}and{' '}
                  <Text
                    style={{ textDecorationLine: 'underline', color: theme.colors.primary }}
                    onPress={() => setPrivacyModalVisible(true)}
                  >
                    privacy policy
                  </Text>
                </Text>
              </View>
              <Button
                mode="contained"
                icon={'chevron-double-right'}
                onPress={handleRegister}
                style={styles.button}
                contentStyle={{ paddingVertical: 4 }}
              >
                Get Start
              </Button>
            </View>
          </Animated.View>

          <View style={{ alignItems: 'center', justifyContent: 'center', }}>
            <Text style={{ fontStyle: 'italic', textAlign: 'center' }}>
              Powered by{' '}
              <Text
                style={{ fontWeight: 'bold', textDecorationLine: 'underline' }}
                onPress={() => Linking.openURL('https://amptechnology.in/')}
              >
                AMP Technology
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Terms and Conditions"
      >
        <ScrollView style={{ maxHeight: 300 }}>
          <Text style={{ whiteSpace: 'pre-line' }}>
            {TERMS_AND_CONDITIONS}
          </Text>
        </ScrollView>
      </CustomModal>

      <CustomModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
        title="Privacy Policy"
      >
        <ScrollView style={{ maxHeight: 300 }}>
          <Text style={{ whiteSpace: 'pre-line' }}>
            {PRIVACY_POLICY}
          </Text>
        </ScrollView>
      </CustomModal>
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>App Version- {appVersion}</Text>
      </View>
    </LinearGradient>
  );

};

const styles = StyleSheet.create({
  screen: {
    position: 'relative',
    flex: 1,
    justifyContent: 'flex-start',
  },
  scrollContent: {
    // paddingBottom: 40,
    // paddingTop: 20,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },

  lottie: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginTop: 20,
  },
  title: {
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sheet: {
    flex: 1,
  },
  formContainer: {
    borderRadius: 24,
    backgroundColor: '#ffffff54',
    margin: 8,
    marginTop: 14,
    borderColor: '#dbe2ef',
    borderWidth: 1,
    zIndex: 1,
    padding: 24,
  },
  input: {
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    marginLeft: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  button: {
    borderRadius: 8,
  },
  dropdown: {
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },

  dropdownContainer: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
  },

  placeholder: {
    color: '#999',
    fontSize: 14,
  },
  selectedText: {
    color: '#000',
    fontWeight: 'bold',
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

export default RegisterScreen;
