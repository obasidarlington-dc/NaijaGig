import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function RateArtisanScreen({ route, navigation }) {
  const { booking } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const submitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please tap a star rating');
      return;
    }
    setLoading(true);
    try {
      // For MVP, i am sending local urls. ideally we should upload to cloud storage but i am broke
      const response = await api.post('/client/reviews', {
        bookingId: booking.id,
        rating,
        comment,
        // photoUrls: photos, // TODO: upload photos first
      });
      if (response.data.success) {
        navigation.replace('ThankYouReview', { artisan: booking.artisan, newRating: rating });
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-8">
      <View className="items-center mb-6">
        <Image source={{ uri: booking.artisan.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg' }} className="w-20 h-20 rounded-full mb-2" />
        <Text className="text-white text-xl font-bold">{booking.artisan.name}</Text>
        <Text className="text-gray-400 text-sm">{booking.serviceType}</Text>
      </View>

      <Text className="text-gray-400 text-center mb-2">TAP TO RATE</Text>
      <View className="flex-row justify-center mb-6">
        {[1,2,3,4,5].map(star => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={40} color={star <= rating ? '#F59E0B' : '#6B7280'} />
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-gray-400 text-sm mb-2">YOUR EXPERIENCE</Text>
      <TextInput
        className="bg-gray-800 rounded-xl p-4 text-white mb-6"
        multiline
        numberOfLines={4}
        placeholder="Share details of your experience..."
        placeholderTextColor="#6B7280"
        value={comment}
        onChangeText={setComment}
      />

      <Text className="text-gray-400 text-sm mb-2">VISUAL PROOF</Text>
      <View className="flex-row flex-wrap mb-6">
        {photos.map((uri, idx) => (
          <Image key={idx} source={{ uri }} className="w-20 h-20 rounded-lg mr-2 mb-2" />
        ))}
        {photos.length < 4 && (
          <TouchableOpacity onPress={pickPhoto} className="w-20 h-20 bg-gray-800 rounded-lg items-center justify-center">
            <Ionicons name="camera" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity onPress={submitReview} disabled={loading} className={`py-4 rounded-xl mb-8 ${loading ? 'bg-gray-700' : 'bg-blue-600'}`}>
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-bold text-lg">Submit Review</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}