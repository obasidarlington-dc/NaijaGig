import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import DiscoverScreen from './DiscoverScreen';
import ClientBookingsScreen from './ClientBookingsScreen';
import ChatListScreen from '../common/ChatListScreen';
import ClientProfileScreen from './ClientProfileScreen';
import ArtisanProfileScreen from './ArtisanProfileScreen';
import CreateBookingScreen from './CreateBookingScreen';
import RateArtisanScreen from './RateArtisanScreen';
import ThankYouReviewScreen from './ThankYouReviewScreen';
import ChatScreen from '../common/ChatScreen';
import EditContactInfo from './EditContactInfo';
import PayoutHistory from './PayoutHistory';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Discover') iconName = focused ? 'compass' : 'compass-outline';
          else if (route.name === 'Gigs') iconName = focused ? 'briefcase' : 'briefcase-outline';
          else if (route.name === 'Messages') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: { backgroundColor: '#000000', borderTopColor: '#1F2937' },
        headerStyle: { backgroundColor: '#000000' },
        headerTitleStyle: { color: '#FFFFFF' },
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Gigs" component={ClientBookingsScreen} />
      <Tab.Screen name="Messages" component={ChatListScreen} />
      <Tab.Screen name="Profile" component={ClientProfileScreen} />
    </Tab.Navigator>
  );
}

export default function ClientApp() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClientTabs" component={ClientTabs} />
      <Stack.Screen name="ArtisanProfile" component={ArtisanProfileScreen} options={{ headerShown: true, title: 'Artisan Profile' }} />
      <Stack.Screen name="CreateBooking" component={CreateBookingScreen} options={{ headerShown: true, title: 'Book Service' }} />
      <Stack.Screen name="RateArtisan" component={RateArtisanScreen} options={{ headerShown: true, title: 'Rate Artisan' }} />
      <Stack.Screen name="ThankYouReview" component={ThankYouReviewScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditContactInfo" component={EditContactInfo} options={{ headerShown: true, title: 'Edit Contact Info' }} />
<Stack.Screen name="PayoutHistory" component={PayoutHistory} options={{ headerShown: true, title: 'Payout History' }} />
    </Stack.Navigator>
  );
}