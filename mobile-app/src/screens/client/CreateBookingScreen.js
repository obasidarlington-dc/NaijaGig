import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../services/api';

export default function CreateBookingScreen({ route, navigation }) {
  const { artisan } = route.params;
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (!description || !address) {
      Alert.alert('Error', 'Please provide description and address');
      return;
    }
    setLoading(true);
    try {
      // Estimate price (e.g., 2 hours * hourly rate)
      const estimatedPrice = (artisan.artisanProfile?.hourlyRate || 5000) * 2;
      
      await api.post('/client/bookings', {
        artisanId: artisan.id,
        serviceType: artisan.artisanProfile?.serviceCategory || 'OTHER',
        description,
        scheduledDate: scheduledDate.toISOString(),
        address,
        latitude: 0, // You can get from geocoding later
        longitude: 0,
        estimatedPrice,
      });
      Alert.alert('Success', 'Booking request sent!', [{ text: 'OK', onPress: () => navigation.popToTop() }]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-6">
      <Text className="text-white text-2xl font-bold mb-2">Book {artisan.name}</Text>
      <Text className="text-gray-400 mb-6">{artisan.artisanProfile?.serviceCategory}</Text>

      <Text className="text-gray-400 text-sm mb-2">DESCRIPTION</Text>
      <TextInput
        className="bg-gray-800 rounded-xl p-4 text-white mb-4"
        multiline
        numberOfLines={4}
        placeholder="Describe the job you need done..."
        placeholderTextColor="#6B7280"
        value={description}
        onChangeText={setDescription}
      />

      <Text className="text-gray-400 text-sm mb-2">SCHEDULED DATE</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} className="bg-gray-800 rounded-xl p-4 mb-4">
        <Text className="text-white">{scheduledDate.toLocaleDateString()} {scheduledDate.toLocaleTimeString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={scheduledDate}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setScheduledDate(selectedDate);
          }}
        />
      )}

      <Text className="text-gray-400 text-sm mb-2">ADDRESS</Text>
      <TextInput
        className="bg-gray-800 rounded-xl p-4 text-white mb-6"
        placeholder="Your full address"
        placeholderTextColor="#6B7280"
        value={address}
        onChangeText={setAddress}
      />

      <TouchableOpacity onPress={handleBooking} disabled={loading} className={`py-4 rounded-xl mb-8 ${loading ? 'bg-gray-700' : 'bg-blue-600'}`}>
        <Text className="text-white text-center font-bold text-lg">Send Booking Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}