import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function AcceptBookingModal({ route, navigation }) {
  const { booking } = route.params;
  const [agreedRate, setAgreedRate] = useState(booking.estimatedPrice?.toString() || '');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!agreedRate || parseInt(agreedRate) <= 0) {
      Alert.alert('Error', 'Please enter a valid agreed rate');
      return;
    }
    if (!confirmed) {
      Alert.alert('Confirm', 'Please confirm that you are available at the requested time.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/artisan/bookings/${booking.id}/accept`, {
        agreedRate: parseInt(agreedRate),
      });

      Alert.alert('Accepted', `You accepted ${booking.client?.name || 'the client'}'s booking at ₦${agreedRate}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to accept booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black px-6 pt-8">
      <Text className="text-white text-2xl font-bold mb-2">Accept Booking</Text>
      <Text className="text-gray-400 mb-6">
        {booking.serviceType || 'Service'} for {booking.client?.name || 'Client'}
      </Text>

      <Text className="text-gray-400 text-sm mb-2">FINAL AGREED RATE</Text>
      <View className="flex-row items-center bg-gray-800 rounded-xl px-4 mb-6">
        <Text className="text-white text-xl mr-2">₦</Text>
        <TextInput
          className="flex-1 text-white text-xl py-3"
          keyboardType="numeric"
          value={agreedRate}
          onChangeText={setAgreedRate}
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        onPress={() => setConfirmed(!confirmed)}
        className="flex-row items-center mb-6"
        disabled={loading}
      >
        <View
          className={`w-5 h-5 rounded border ${
            confirmed ? 'bg-blue-600 border-blue-600' : 'border-gray-500'
          } mr-3 items-center justify-center`}
        >
          {confirmed && <Ionicons name="checkmark" size={14} color="white" />}
        </View>
        <Text className="text-white">I am available at the requested time.</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleConfirm}
        disabled={loading || !confirmed}
        className={`py-4 rounded-xl mb-4 ${
          loading || !confirmed ? 'bg-gray-700' : 'bg-blue-600'
        }`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-bold text-lg">Confirm & Accept</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
        <Text className="text-red-500 text-center">Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}