import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StatusBar,
  SafeAreaView, ScrollView, ActivityIndicator, Alert, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

export default function ProfileWizard({ route, navigation }) {
  const { userId } = route.params;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Service Category
  const categories = ['Electrician', 'Plumber', 'Carpenter', 'DJ', 'Painter', 'Mechanic'];
  const [selectedCategory, setSelectedCategory] = useState('');

  // Step 2: Profile details
  const [photo, setPhoto] = useState(null);
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [experience, setExperience] = useState('');

  // Step 3: Location
  const [address, setAddress] = useState('');
  const [serviceArea, setServiceArea] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async () => {
    if (!photo) return null;
    const formData = new FormData();
    formData.append('file', {
      uri: photo,
      name: 'profile.jpg',
      type: 'image/jpeg',
    });
    // Upload to your backend (you need an endpoint for image upload)
    const response = await api.post('/upload/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  };

  const handleNext = () => {
    if (step === 1 && !selectedCategory) {
      Alert.alert('Error', 'Please select a service category');
      return;
    }
    if (step === 2) {
      if (!bio || bio.length < 50) {
        Alert.alert('Error', 'Bio must be at least 50 characters');
        return;
      }
      if (!hourlyRate) {
        Alert.alert('Error', 'Please enter hourly rate');
        return;
      }
      if (!experience) {
        Alert.alert('Error', 'Please enter years of experience');
        return;
      }
    }
    if (step === 3 && !address) {
      Alert.alert('Error', 'Please enter your address');
      return;
    }
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let photoUrl = null;
      if (photo) photoUrl = await uploadPhoto();

      const payload = {
        userId,
        serviceCategory: selectedCategory.toUpperCase(),
        bio,
        hourlyRate: parseFloat(hourlyRate),
        yearsExperience: parseInt(experience),
        address,
        serviceArea,
        profileImage: photoUrl,
      };
      await api.post('/artisan/profile', payload);
      Alert.alert('Success', 'Profile completed!', [
        { text: 'OK', onPress: () => navigation.replace('MainApp') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      <ScrollView className="flex-1 px-6 pt-8">
        {/* Progress indicator */}
        <View className="flex-row justify-between mb-8">
          <Text className={`text-sm ${step >= 1 ? 'text-blue-600' : 'text-gray-600'}`}>Step 1/3</Text>
          <Text className={`text-sm ${step >= 2 ? 'text-blue-600' : 'text-gray-600'}`}>Step 2/3</Text>
          <Text className={`text-sm ${step >= 3 ? 'text-blue-600' : 'text-gray-600'}`}>Step 3/3</Text>
        </View>

        {step === 1 && (
          <>
            <Text className="text-white text-2xl font-bold mb-2">Tell us about your service</Text>
            <Text className="text-gray-400 mb-6">Select your primary trade to start receiving high-quality leads.</Text>
            <View className="flex-row flex-wrap justify-between">
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  className={`w-[48%] p-4 rounded-xl mb-4 ${selectedCategory === cat ? 'bg-blue-600' : 'bg-gray-800'}`}
                >
                  <Text className="text-white text-center">{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text className="text-white text-2xl font-bold mb-2">Build Your Profile</Text>
            <Text className="text-gray-400 mb-6">Help clients get to know you better.</Text>

            <TouchableOpacity onPress={pickImage} className="bg-gray-800 p-4 rounded-xl items-center mb-6">
              {photo ? (
                <Image source={{ uri: photo }} className="w-24 h-24 rounded-full" />
              ) : (
                <Text className="text-white">ADD PHOTO</Text>
              )}
            </TouchableOpacity>

            <Text className="text-gray-400 text-sm mb-2">Professional Bio (min 50 words)</Text>
            <TextInput
              className="bg-white rounded-xl p-4 text-black mb-6"
              multiline
              numberOfLines={5}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell clients about your expertise..."
            />

            <Text className="text-gray-400 text-sm mb-2">Hourly Rate (₦/hr)</Text>
            <TextInput
              className="bg-white rounded-xl p-4 text-black mb-6"
              keyboardType="numeric"
              value={hourlyRate}
              onChangeText={setHourlyRate}
              placeholder="5000"
            />

            <Text className="text-gray-400 text-sm mb-2">Years of Experience</Text>
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => setExperience(String(Math.max(0, parseInt(experience || '0') - 1)))} className="bg-gray-800 p-3 rounded-l-xl">
                <Text className="text-white text-xl">-</Text>
              </TouchableOpacity>
              <TextInput
                className="bg-white p-3 text-center w-20"
                keyboardType="numeric"
                value={experience}
                onChangeText={setExperience}
              />
              <TouchableOpacity onPress={() => setExperience(String((parseInt(experience || '0') + 1)))} className="bg-gray-800 p-3 rounded-r-xl">
                <Text className="text-white text-xl">+</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text className="text-white text-2xl font-bold mb-2">Set Your Location</Text>
            <Text className="text-gray-400 mb-6">Connect with nearby clients. Your specific address stays private until a job is booked.</Text>

            <Text className="text-gray-400 text-sm mb-2">Address</Text>
            <TextInput
              className="bg-white rounded-xl p-4 text-black mb-6"
              value={address}
              onChangeText={setAddress}
              placeholder="42 Awka Road, Onitsha South, Anambra State"
            />

            <Text className="text-gray-400 text-sm mb-2">Service Area (optional)</Text>
            <TextInput
              className="bg-white rounded-xl p-4 text-black mb-6"
              value={serviceArea}
              onChangeText={setServiceArea}
              placeholder="e.g., Onitsha, Awka, Nnewi"
            />
            <Text className="text-gray-500 text-xs text-center mt-4">Profile reviewed within 24 hours</Text>
          </>
        )}

        <TouchableOpacity
          onPress={handleNext}
          disabled={loading}
          className={`rounded-xl py-4 mt-8 ${loading ? 'bg-blue-800' : 'bg-blue-600'}`}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-bold">{step === 3 ? 'Complete Profile' : 'Continue'}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}