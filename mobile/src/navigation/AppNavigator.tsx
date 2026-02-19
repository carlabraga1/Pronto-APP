import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../constants/colors';
import TabNavigator from './TabNavigator';
import LocationScreen from '../screens/Location';
import SubCategoryScreen from '../screens/SubCategory';
import EditProfileScreen from '../screens/Profile/EditProfile';
import EditFieldScreen from '../screens/Profile/EditProfile/EditField';
import PrivacyPolicyScreen from '../screens/Profile/PrivacyPolicy';
import OrderDetailScreen from '../screens/Orders/OrderDetail';
import CreateOrderScreen from '../screens/CreateOrder';
import AvailableProfessionalsScreen from '../screens/AvailableProfessionals';
import OrderTrackingScreen from '../screens/OrderTracking';
import ChatScreen from '../screens/Chat';
import ProfessionalProfileScreen from '../screens/ProfessionalProfile';
import NotificationsScreen from '../screens/Notifications';
import MyAddressesScreen from '../screens/Profile/MyAddresses';
import AddAddressScreen from '../screens/Profile/MyAddresses/AddAddress';
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundDark }}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {signed ? (
        <>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen
            name="Location"
            component={LocationScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="SubCategory"
            component={SubCategoryScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="PrivacyPolicy"
            component={PrivacyPolicyScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="OrderDetail"
            component={OrderDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="CreateOrder"
            component={CreateOrderScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="AvailableProfessionals"
            component={AvailableProfessionalsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="OrderTracking"
            component={OrderTrackingScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="OrderChat"
            component={ChatScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ProfessionalProfile"
            component={ProfessionalProfileScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="EditField"
            component={EditFieldScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="MyAddresses"
            component={MyAddressesScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="AddAddress"
            component={AddAddressScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
