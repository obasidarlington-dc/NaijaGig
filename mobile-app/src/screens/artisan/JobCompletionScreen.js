import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

export default function JobCompletionScreen({ route, navigation }) {
  const { job } = route.params;
  const [finalAmount, setFinalAmount] = useState(job.finalPrice?.toString() || job.estimatedPrice?.toString() || '');
  const [summary, setSummary] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos.');
      return;
    }
    if (photos.length >= 4) {
      Alert.alert('Limit reached', 'You can upload up to 4 photos.');
      return;
    }
    // const result = await ImagePicker.launchImageLibraryAsync({
    //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //   quality: 0.8,
    // });
  
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'Images',
    quality: 0.8,
  });
    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  // i will only store local URIs; actual upload will be implemented later.
  // The backend expects photoUrls array (strings).
  const handleSubmit = async () => {
  if (!finalAmount || parseInt(finalAmount) <= 0) {
    Alert.alert('Error', 'Please enter a valid final amount');
    return;
  }
  if (!summary.trim()) {
    Alert.alert('Error', 'Please provide a work summary');
    return;
  }
  setLoading(true);
  try {
    // 1. Upload photos first (if any)
    let uploadedUrls = [];
    if (photos.length > 0) {
      const formData = new FormData();
      for (let i = 0; i < photos.length; i++) {
        formData.append('photos', {
          uri: photos[i],
          name: `proof_${Date.now()}_${i}.jpg`,
          type: 'image/jpeg',
        });
      }
      const uploadRes = await api.post(`/upload/job-proof/${job.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      uploadedUrls = uploadRes.data.urls;
    }
    // 2. Complete the job with the photo URLs
    await api.post(`/artisan/bookings/${job.id}/complete`, {
      finalAmount: parseInt(finalAmount),
      workSummary: summary,
      photoUrls: uploadedUrls,
    });
    Alert.alert('Success', 'Job marked as completed!', [
      { text: 'OK', onPress: () => navigation.popToTop() },
    ]);
  } catch (error) {
    console.error(error);
    Alert.alert('Error', error.response?.data?.error || 'Failed to complete job');
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-6">
      {/* Client info card */}
      <View className="bg-gray-900 rounded-2xl p-4 mb-6">
        <Text className="text-gray-400 text-sm">CLIENT PROFILE</Text>
        <Text className="text-white text-lg font-bold">{job.client?.name || job.name}</Text>
        <Text className="text-gray-400">{job.description || job.title}</Text>
        <Text className="text-gray-500 text-xs mt-1">
          {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'Date not set'}
        </Text>
      </View>

      {/* Final Amount */}
      <Text className="text-white font-semibold mb-2">Final Amount Charged</Text>
      <View className="flex-row items-center bg-gray-800 rounded-xl px-4 mb-2">
        <Text className="text-white text-xl mr-2">₦</Text>
        <TextInput
          className="flex-1 text-white text-xl py-3"
          keyboardType="numeric"
          value={finalAmount}
          onChangeText={setFinalAmount}
        />
      </View>
      <Text className="text-gray-500 text-xs mb-6">
        Note: Service fee of 5% will be deducted from this amount.
      </Text>

      {/* Work Summary */}
      <Text className="text-white font-semibold mb-2">Work Summary</Text>
      <TextInput
        className="bg-gray-800 rounded-xl p-4 text-white mb-6"
        multiline
        numberOfLines={4}
        placeholder="Describe the completed work..."
        placeholderTextColor="#6B7280"
        value={summary}
        onChangeText={setSummary}
      />

      {/* Proof Photos */}
      <Text className="text-white font-semibold mb-2">Proof of Work Photos (MAX 4)</Text>
      <View className="flex-row flex-wrap mb-6">
        {photos.map((uri, idx) => (
          <View key={idx} className="relative mr-2 mb-2">
            <Image source={{ uri }} className="w-20 h-20 rounded-lg" />
            <TouchableOpacity
              onPress={() => removePhoto(idx)}
              className="absolute -top-2 -right-2 bg-red-600 rounded-full w-6 h-6 items-center justify-center"
            >
              <Text className="text-white text-xs font-bold">✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        {photos.length < 4 && (
          <TouchableOpacity
            onPress={pickPhoto}
            className="w-20 h-20 bg-gray-800 rounded-lg items-center justify-center"
          >
            <Text className="text-white text-xs text-center">ADD PHOTO</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        className={`py-4 rounded-xl mb-8 ${loading ? 'bg-gray-700' : 'bg-blue-600'}`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-bold text-lg">Mark as Completed</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}