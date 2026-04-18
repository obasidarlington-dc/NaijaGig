import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ThankYouReviewScreen({ route, navigation }) {
  const { artisan, newRating } = route.params;
  return (
    <View className="flex-1 bg-black px-6 justify-center items-center">
      <Ionicons name="checkmark-circle" size={80} color="#10B981" />
      <Text className="text-white text-2xl font-bold text-center mt-4">Thank you for your feedback!</Text>
      <Text className="text-gray-400 text-center mt-2">Your review helps the community find quality artisans.</Text>
      <View className="items-center mt-8">
        <Image source={{ uri: artisan.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg' }} className="w-16 h-16 rounded-full mb-2" />
        <Text className="text-white text-lg font-bold">{artisan.name}</Text>
        <Text className="text-gray-400 text-sm">{artisan.artisanProfile?.serviceCategory || 'Artisan'}</Text>
        <View className="flex-row items-center mt-2">
          <Text className="text-yellow-500 text-xl mr-1">⭐</Text>
          <Text className="text-white text-lg font-bold">{newRating}.0</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => navigation.popToTop()} className="bg-blue-600 py-3 px-8 rounded-xl mt-8">
        <Text className="text-white font-bold">Done</Text>
      </TouchableOpacity>
    </View>
  );
}