import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen({ navigation }) {
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


const uploadProfilePhoto = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });
  if (!result.canceled) {
    const formData = new FormData();
    formData.append('image', {
      uri: result.assets[0].uri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    });
    setUploading(true);
    try {
      const response = await api.post('/upload/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfileImage(response.data.url);
      Alert.alert('Success', 'Profile photo updated');
    } catch (error) {
      Alert.alert('Error', 'Upload failed');
    } finally {
      setUploading(false);
    }
  }
};



  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  if (!profile) return null;

  const artisan = profile.artisanProfile || {};
  const rating = artisan.averageRating || 0;
  const totalJobs = artisan.totalJobs || 0;

  // Menu items for artisan (icon, label, navigate to)
  const menuItems = [
    { icon: 'cash-outline', label: 'Earnings', route: 'Earnings' },
    { icon: 'card-outline', label: 'Bank Account', route: 'BankSetup' },
    { icon: 'arrow-up-outline', label: 'Withdraw', route: 'Withdrawal' },
    { icon: 'log-out-outline', label: 'Logout', route: null, action: handleLogout },
  ];

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-6">
      {/* Profile header */}
      <View className="items-center mb-6">
        <Image
          source={{ uri: profile.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg' }}
          className="w-24 h-24 rounded-full mb-2"
        />
        <Text className="text-white text-xl font-bold">{profile.name}</Text>
        <Text className="text-gray-400">
          {artisan.serviceCategory || 'Artisan'} | {rating.toFixed(1)} ★ ({totalJobs} jobs)
        </Text>
      </View>

      {/* Beveled square buttons grid */}
      <View className="flex-row flex-wrap justify-between mb-6">
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => item.route ? navigation.navigate(item.route) : item.action()}
            className="w-[23%] aspect-square bg-gray-800 rounded-xl items-center justify-center mb-2"
          >
            <Ionicons name={item.icon} size={28} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs mt-1 text-center">{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contact Info Section */}
      <View className="bg-gray-900 rounded-2xl p-4 mb-4">
        <Text className="text-white font-bold mb-2">Contact Info</Text>
        <Text className="text-gray-400">📞 {profile.phone || 'Not provided'}</Text>
        <Text className="text-gray-400">✉️ {profile.email}</Text>
      </View>

      <View className="bg-gray-900 rounded-2xl p-4 mb-4">
        <Text className="text-white font-bold mb-2">Professional Bio</Text>
        <Text className="text-gray-400">{artisan.bio || 'No bio yet'}</Text>
      </View>

      <View className="bg-gray-900 rounded-2xl p-4 mb-4">
        <Text className="text-white font-bold mb-2">Rates & Experience</Text>
        <Text className="text-gray-400">💰 ₦{artisan.hourlyRate || 0}/hour</Text>
        <Text className="text-gray-400">📅 {artisan.yearsExperience || 0} years experience</Text>
      </View>

      <View className="bg-gray-900 rounded-2xl p-4 mb-8">
        <Text className="text-white font-bold mb-2">Location</Text>
        <Text className="text-gray-400">📍 {artisan.address || 'Not set'}</Text>
        {artisan.serviceArea && <Text className="text-gray-400">🗺️ Service area: {artisan.serviceArea}</Text>}
      </View>
    </ScrollView>
  );
}