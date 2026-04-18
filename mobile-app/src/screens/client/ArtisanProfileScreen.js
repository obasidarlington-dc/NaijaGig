import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function ArtisanProfileScreen({ route, navigation }) {
  const { artisanId } = route.params;
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtisan();
  }, []);

  const fetchArtisan = async () => {
    try {
      const response = await api.get(`/client/artisans/${artisanId}`);
      setArtisan(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Could not load artisan profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View className="flex-1 bg-black justify-center items-center"><ActivityIndicator color="white" /></View>;
  if (!artisan) return null;

  const profile = artisan.artisanProfile || {};
  const reviews = artisan.reviewsReceived || [];

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-6">
      <View className="items-center mb-6">
        <Image source={{ uri: artisan.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg' }} className="w-24 h-24 rounded-full mb-2" />
        <Text className="text-white text-2xl font-bold">{artisan.name}</Text>
        <Text className="text-blue-400 text-sm">{profile.serviceCategory}</Text>
      </View>

      <View className="flex-row justify-around mb-6">
        <View className="items-center">
          <Text className="text-white text-xl font-bold">{profile.averageRating?.toFixed(1) || 'New'}</Text>
          <Text className="text-gray-400 text-xs">⭐ Rating</Text>
        </View>
        <View className="items-center">
          <Text className="text-white text-xl font-bold">{profile.totalJobs || 0}</Text>
          <Text className="text-gray-400 text-xs">Jobs</Text>
        </View>
        <View className="items-center">
          <Text className="text-white text-xl font-bold">₦{profile.hourlyRate || 0}/hr</Text>
          <Text className="text-gray-400 text-xs">Hourly Rate</Text>
        </View>
      </View>

      <View className="bg-gray-900 rounded-2xl p-4 mb-4">
        <Text className="text-white font-bold mb-2">Professional Bio</Text>
        <Text className="text-gray-300">{profile.bio || 'No bio provided'}</Text>
      </View>

      {reviews.length > 0 && (
        <View className="bg-gray-900 rounded-2xl p-4 mb-4">
          <Text className="text-white font-bold mb-2">Recent Reviews</Text>
          {reviews.slice(0, 3).map(review => (
            <View key={review.id} className="border-b border-gray-800 py-2">
              <Text className="text-gray-300">{review.comment}</Text>
              <Text className="text-gray-500 text-xs mt-1">- {review.author?.name}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate('CreateBooking', { artisan })}
        className="bg-blue-600 py-4 rounded-xl mb-8"
      >
        <Text className="text-white text-center font-bold text-lg">Request Booking</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}