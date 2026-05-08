import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function ClientProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setProfile(response.data.data.user);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    navigation.replace('Welcome');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  if (!profile) return null;

  const menuItems = [
    { icon: 'create-outline', label: 'Change Contact Info', route: 'EditContactInfo' },
    { icon: 'receipt-outline', label: 'Payout History', route: 'PayoutHistory' },
    { icon: 'log-out-outline', label: 'Logout', route: null, action: handleLogout },
  ];

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-6">
      <View className="items-center mb-6">
        <Image source={{ uri: profile.profileImage || 'https://randomuser.me/api/portraits/women/1.jpg' }} className="w-24 h-24 rounded-full mb-2" />
        <Text className="text-white text-xl font-bold">{profile.name}</Text>
        <Text className="text-gray-400">{profile.email}</Text>
      </View>

      <View className="flex-row flex-wrap justify-between mb-6">
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => item.route ? navigation.navigate(item.route) : item.action()}
            className="w-[30%] aspect-square bg-gray-800 rounded-xl items-center justify-center mb-2"
          >
            <Ionicons name={item.icon} size={28} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs mt-1 text-center">{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="bg-gray-900 rounded-2xl p-4 mb-8">
        <Text className="text-white font-bold mb-2">Contact Info</Text>
        <Text className="text-gray-400">📞 {profile.phone || 'Not provided'}</Text>
        <Text className="text-gray-400">✉️ {profile.email}</Text>
      </View>
    </ScrollView>
  );
}