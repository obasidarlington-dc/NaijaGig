import React, { useState } from 'react';
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
} from 'react-native';
import api from '../services/api';

export default function SignUpScreen({ navigation, route }) {
  const role = route?.params?.role || 'CLIENT';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Sign Up
  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: role,
      });

      if (response.data.success) {
        // Show success message and navigate to verification
        Alert.alert(
          'Success', 
          'Account created! Check your email for verification code.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('VerifyEmail', { 
                email: formData.email.toLowerCase().trim() 
              })
            }
          ]
        );
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed. Please try again.';
      Alert.alert('Error', message);
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
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="px-6 pt-4 pb-8">
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-12 h-12 rounded-full bg-gray-900 items-center justify-center mb-6"
              activeOpacity={0.7}
            >
              <Text className="text-white text-xl">←</Text>
            </TouchableOpacity>

            {/* Logo */}
            <View className="items-center mb-8">
              <View className="w-14 h-14 bg-blue-600 rounded-2xl items-center justify-center">
                <Text className="text-2xl">🔨</Text>
              </View>
            </View>

            {/* Title */}
            <Text className="text-white text-3xl font-bold mb-2">
              Create Your Account
            </Text>
            <Text className="text-gray-400 text-base">
              Join the elite marketplace for Nigerian artisans.
            </Text>
          </View>

          {/* Form */}
          <View className="px-6">
            {/* Full Name */}
            <View className="mb-6">
              <Text className="text-gray-400 text-xs font-semibold mb-2 tracking-wider">
                FULL NAME
              </Text>
              <TextInput
                className={`bg-white rounded-2xl px-5 py-4 text-black text-base ${
                  errors.name ? 'border-2 border-red-500' : ''
                }`}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={formData.name}
                onChangeText={(text) => {
                  setFormData({ ...formData, name: text });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                autoCapitalize="words"
                editable={!loading}
              />
              {errors.name && (
                <Text className="text-red-500 text-xs mt-1 ml-2">{errors.name}</Text>
              )}
            </View>

            {/* Email Address */}
            <View className="mb-6">
              <Text className="text-gray-400 text-xs font-semibold mb-2 tracking-wider">
                EMAIL ADDRESS
              </Text>
              <TextInput
                className={`bg-white rounded-2xl px-5 py-4 text-black text-base ${
                  errors.email ? 'border-2 border-red-500' : ''
                }`}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(text) => {
                  setFormData({ ...formData, email: text });
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {errors.email && (
                <Text className="text-red-500 text-xs mt-1 ml-2">{errors.email}</Text>
              )}
            </View>

            {/* Password */}
            <View className="mb-6">
              <Text className="text-gray-400 text-xs font-semibold mb-2 tracking-wider">
                PASSWORD
              </Text>
              <TextInput
                className={`bg-white rounded-2xl px-5 py-4 text-black text-base ${
                  errors.password ? 'border-2 border-red-500' : ''
                }`}
                placeholder="Create a password"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({ ...formData, password: text });
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                secureTextEntry
                editable={!loading}
              />
              {errors.password && (
                <Text className="text-red-500 text-xs mt-1 ml-2">{errors.password}</Text>
              )}
            </View>

            {/* Terms & Conditions */}
            <Text className="text-gray-500 text-xs text-center mb-6 leading-5">
              By clicking continue, you agree to our{' '}
              <Text className="text-blue-500">Terms of Service</Text> and{' '}
              <Text className="text-blue-500">Privacy Policy</Text>.
            </Text>

            {/* Continue Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              className={`rounded-2xl py-4 mb-6 ${
                loading ? 'bg-blue-800' : 'bg-blue-600'
              }`}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center text-lg font-semibold">
                  Continue
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-gray-800" />
              <Text className="text-gray-600 text-xs mx-4 tracking-widest">
                OR SIGN UP WITH
              </Text>
              <View className="flex-1 h-px bg-gray-800" />
            </View>

            {/* Social Sign In */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-gray-900 rounded-2xl py-4 mb-8"
              activeOpacity={0.8}
            >
              <View className="w-5 h-5 bg-white rounded mr-3" />
              <Text className="text-white text-base font-medium">Google</Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-400 text-sm">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                <Text className="text-blue-500 text-sm font-semibold">
                  Log In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}