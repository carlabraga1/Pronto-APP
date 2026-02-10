import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import LocationScreen from '../screens/Location';
import SubCategoryScreen from '../screens/SubCategory';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
    </Stack.Navigator>
  );
}
