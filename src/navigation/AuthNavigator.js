import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignUpScreen from '../screens/SignUpScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import IdentitySetupScreen from '../screens/IdentitySetupScreen';
import MainApp from '../screens/MainApp';
import ClientApp from '../screens/client/ClientApp';
import LoginScreen from '../screens/LoginScreen';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000000' },
        animationEnabled: true,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="IdentitySetup" component={IdentitySetupScreen} />
      <Stack.Screen name="MainApp" component={MainApp} />
      <Stack.Screen name="ClientApp" component={ClientApp} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}