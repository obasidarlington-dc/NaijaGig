import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StatusBar,
  SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { registerForPushNotificationsAsync } from '../services/notifications'; // 👈 import

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Please enter email and password');
    return;
  }
  setLoading(true);
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data.data;

    await AsyncStorage.setItem('authToken', token);
    
    // Push registration
    try {
      await registerForPushNotificationsAsync();
    } catch (pushErr) {
      console.log('Push registration skipped (Expo Go limitation)');
    }

    Alert.alert('Success', `Welcome back, ${user.name}!`);

    if (user.role === 'ARTISAN') {
      const profile = user.artisanProfile;
      const isProfileComplete = profile && 
        profile.serviceCategory && 
        profile.bio && 
        profile.hourlyRate && 
        profile.address;
      if (!isProfileComplete) {
        navigation.replace('ProfileWizard', { userId: user.id });
      } else {
        navigation.replace('MainApp');
      }
    } else {
      navigation.replace('ClientApp');
    }
  } catch (error) {
    Alert.alert('Login Failed', error.response?.data?.error || 'Invalid credentials');
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-1 justify-center px-6">
          <View className="items-center mb-12">
            <Text className="text-white text-4xl font-bold">ProxiCraft</Text>
            <Text className="text-gray-400 mt-2">Log in to your professional account</Text>
          </View>

          <TextInput
            className="bg-white rounded-2xl px-5 py-4 text-black text-base mb-4"
            placeholder="EMAIL ADDRESS"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            className="bg-white rounded-2xl px-5 py-4 text-black text-base mb-4"
            placeholder="PASSWORD"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity className="self-end mb-6">
            <Text className="text-blue-500">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogin} disabled={loading} className="bg-blue-600 rounded-2xl py-4 mb-6">
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center text-lg font-semibold">Log In</Text>}
          </TouchableOpacity>

          {/* <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-800" />
            <Text className="text-gray-600 mx-4">OR CONNECT WITH</Text>
            <View className="flex-1 h-px bg-gray-800" />
          </View>

          <View className="flex-row justify-center space-x-4">
            <TouchableOpacity className="flex-1 bg-gray-900 rounded-2xl py-3 items-center mr-2">
              <Text className="text-white">Google</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-gray-900 rounded-2xl py-3 items-center ml-2">
              <Text className="text-white">Apple</Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
