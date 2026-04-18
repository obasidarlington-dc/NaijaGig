import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../../services/api';

export default function EditContactInfo({ navigation }) {
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.data.user;
      setPhone(user.phone || '');
      setAddress(user.address || '');
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/update-profile', { phone, address });
      Alert.alert('Success', 'Contact info updated');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View className="flex-1 bg-black justify-center items-center"><ActivityIndicator color="white" /></View>;

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-6">
      <Text className="text-white text-2xl font-bold mb-6">Edit Contact Info</Text>

      <Text className="text-gray-400 text-sm mb-2">Phone Number</Text>
      <TextInput
        className="bg-gray-800 rounded-xl p-4 text-white mb-4"
        placeholder="Enter phone number"
        placeholderTextColor="#6B7280"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <Text className="text-gray-400 text-sm mb-2">Default Address</Text>
      <TextInput
        className="bg-gray-800 rounded-xl p-4 text-white mb-6"
        placeholder="Enter your address"
        placeholderTextColor="#6B7280"
        value={address}
        onChangeText={setAddress}
      />

      <TouchableOpacity onPress={handleSave} disabled={saving} className="bg-blue-600 py-4 rounded-xl">
        {saving ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-bold">Save Changes</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}