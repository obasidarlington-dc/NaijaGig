import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import * as Location from 'expo-location';
import api from '../services/api';

export default function IdentitySetupScreen({ route, navigation }) {
  const { email } = route.params;
  
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Request location permission and get current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location to find nearby artisans.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      Alert.alert('Location set', 'We’ll use your current location.');
    } catch (error) {
      Alert.alert('Error', 'Could not get location. Please enter address manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  // Complete setup: send all data to backend
  const handleCompleteSetup = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your delivery address.');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email,
        phoneNumber,
        twoFactorEnabled,
        address: address.trim(),
        apartment: apartment.trim() || null,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
      };
      const response = await api.post('/auth/complete-artisan-setup', payload);
      Alert.alert('Success', 'Profile setup complete!', [
        { text: 'OK', onPress: () => navigation.replace('MainApp') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="px-6 pt-12">
            <Text className="text-blue-600 text-sm font-semibold mb-2">Final Step</Text>
            <Text className="text-white text-3xl font-bold mb-2">
              Where are you located?
            </Text>
            <Text className="text-gray-400 text-base mb-8">
              This helps us find the best artisans near you.
            </Text>

            {/* Current Location Button */}
            <TouchableOpacity
              onPress={getCurrentLocation}
              disabled={locationLoading}
              className="flex-row items-center justify-center bg-gray-800 rounded-2xl py-4 mb-6"
            >
              {locationLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-base font-semibold mr-2">📍</Text>
                  <Text className="text-white text-base font-semibold">
                    Use My Current Location
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Delivery Address */}
            <View className="mb-6">
              <Text className="text-gray-400 text-xs font-semibold mb-2 tracking-wider">
                DELIVERY ADDRESS
              </Text>
              <TextInput
                className="bg-white rounded-2xl px-5 py-4 text-black text-base"
                placeholder="Street, city, postal code"
                placeholderTextColor="#9CA3AF"
                value={address}
                onChangeText={setAddress}
              />
            </View>

            {/* Apartment / Suite (Optional) */}
            <View className="mb-8">
              <Text className="text-gray-400 text-xs font-semibold mb-2 tracking-wider">
                APARTMENT / SUITE (OPTIONAL)
              </Text>
              <TextInput
                className="bg-white rounded-2xl px-5 py-4 text-black text-base"
                placeholder="Apt, suite, unit, etc."
                placeholderTextColor="#9CA3AF"
                value={apartment}
                onChangeText={setApartment}
              />
            </View>

            {/* Phone Number (still needed) */}
            <View className="mb-6">
              <Text className="text-gray-400 text-xs font-semibold mb-2 tracking-wider">
                PHONE NUMBER
              </Text>
              <TextInput
                className="bg-white rounded-2xl px-5 py-4 text-black text-base"
                placeholder="+234 803 000 0000"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>

            {/* 2FA Toggle */}
            <View className="flex-row justify-between items-center py-4 border-t border-gray-800 mb-8">
              <View className="flex-1 mr-4">
                <Text className="text-white text-base font-semibold">
                  Two-Factor Authentication
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  Add an extra layer of security
                </Text>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={setTwoFactorEnabled}
                trackColor={{ false: '#374151', true: '#2563EB' }}
                thumbColor={twoFactorEnabled ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            {/* Complete Setup Button */}
            <TouchableOpacity
              onPress={handleCompleteSetup}
              disabled={loading}
              className={`rounded-2xl py-4 ${loading ? 'bg-blue-800' : 'bg-blue-600'}`}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center text-lg font-semibold">
                  Complete Setup
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}