import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ChatListScreen from './common/ChatListScreen';
import ChatScreen from './common/ChatScreen';


// Import screens
import DashboardScreen from './artisan/DashboardScreen';
import RequestsScreen from './artisan/RequestsScreen';
import ActiveJobsScreen from './artisan/ActiveJobsScreen';
import EarningsScreen from './artisan/EarningsScreen';
import ProfileScreen from './artisan/ProfileScreen';
import AcceptBookingModal from './artisan/AcceptBookingModal';
import JobCompletionScreen from './artisan/JobCompletionScreen';
import BankSetupScreen from './artisan/BankSetupScreen';
import WithdrawalScreen from './artisan/WithdrawalScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();




function ArtisanTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Requests') {
            iconName = focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Active') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: { backgroundColor: '#000000', borderTopColor: '#1F2937', paddingBottom: 5, paddingTop: 5 },
        headerStyle: { backgroundColor: '#000000' },
        headerTitleStyle: { color: '#FFFFFF' },
        headerTintColor: '#FFFFFF',
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Requests" component={RequestsScreen} />
      <Tab.Screen name="Active" component={ActiveJobsScreen} />
      <Tab.Screen name="Messages" component={ChatListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function MainApp() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ArtisanTabs" component={ArtisanTabs} />
      <Stack.Screen name="AcceptBooking" component={AcceptBookingModal} options={{ presentation: 'modal', headerShown: true, title: 'Accept Booking' }} />
      <Stack.Screen name="JobCompletion" component={JobCompletionScreen} options={{ headerShown: true, title: 'Complete Job' }} />
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: true, title: 'Messages' }} />
     <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
     <Stack.Screen name="Earnings" component={EarningsScreen} options={{ headerShown: true, title: 'Earnings' }} />
     <Stack.Screen name="BankSetup" component={BankSetupScreen} options={{ headerShown: true, title: 'Bank Account' }} />
<Stack.Screen name="Withdrawal" component={WithdrawalScreen} options={{ headerShown: true, title: 'Withdraw' }} />
    </Stack.Navigator>
  );
}