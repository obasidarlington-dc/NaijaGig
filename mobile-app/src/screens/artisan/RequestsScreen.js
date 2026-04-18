import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function RequestsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('pending'); // pending, accepted, completed
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBookings = async (status) => {
    let endpoint = '/artisan/bookings';
    if (status === 'pending') endpoint += '?status=pending';
    else if (status === 'accepted') endpoint += '?status=active'; // active includes ACCEPTED & IN_PROGRESS
    else if (status === 'completed') endpoint += '?status=completed';
    const response = await api.get(endpoint);
    return response.data.data;
  };

  const loadData = async () => {
    try {
      const data = await fetchBookings(activeTab);
      setBookings(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [activeTab]);

  // Refresh when screen comes into focus (after accepting a booking)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [activeTab]);

  const handleAccept = (booking) => {
    navigation.navigate('AcceptBooking', { booking });
  };

  const handleDecline = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await api.post(`/artisan/bookings/${bookingId}/decline`);
      Alert.alert('Declined', 'You have declined this request.');
      loadData(); // refresh list
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to decline');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'ACCEPTED') return 'text-yellow-500';
    if (status === 'IN_PROGRESS') return 'text-green-500';
    if (status === 'COMPLETED') return 'text-blue-500';
    return 'text-gray-400';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 pt-6 pb-2">
        <Text className="text-white text-2xl font-bold">Gig Requests</Text>
        <Text className="text-gray-400">
          {activeTab === 'pending'
            ? `${bookings.length} NEW OPPORTUNITIES`
            : `${bookings.length} ${activeTab} jobs`}
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 border-b border-gray-800">
        {['pending', 'accepted', 'completed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`mr-6 py-3 ${activeTab === tab ? 'border-b-2 border-blue-600' : ''}`}
          >
            <Text
              className={`${activeTab === tab ? 'text-blue-600' : 'text-gray-400'} font-semibold capitalize`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
      >
        {bookings.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="chatbox-ellipses-outline" size={48} color="#6B7280" />
            <Text className="text-gray-400 text-center mt-4">
              No {activeTab} requests
            </Text>
          </View>
        ) : (
          bookings.map((booking) => (
            <View key={booking.id} className="bg-gray-900 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <Image
                  source={{
                    uri:
                      booking.client?.profileImage ||
                      'https://randomuser.me/api/portraits/men/1.jpg',
                  }}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <View className="flex-1">
                  <Text className="text-white font-bold">{booking.client?.name || 'Client'}</Text>
                  <Text className="text-blue-400 text-xs">{booking.serviceType}</Text>
                </View>
                <Text className="text-green-500 font-bold">₦{booking.estimatedPrice?.toLocaleString()}</Text>
              </View>

              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400 text-xs">
                  {booking.scheduledDate ? formatDate(booking.scheduledDate) : 'Date not set'}
                </Text>
                <Text className="text-gray-400 text-xs">
                  {booking.address ? `${booking.address.split(',')[0]}` : 'Location TBD'}
                </Text>
              </View>

              {activeTab !== 'pending' && (
                <View className="flex-row justify-end mt-2">
                  <Text className={`text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                    {booking.status === 'ACCEPTED'
                      ? 'Accepted'
                      : booking.status === 'IN_PROGRESS'
                      ? 'In Progress'
                      : booking.status === 'COMPLETED'
                      ? 'Completed'
                      : 'Unknown'}
                  </Text>
                </View>
              )}

              {activeTab === 'pending' && (
                <View className="flex-row justify-end space-x-3 mt-3">
                  <TouchableOpacity
                    onPress={() => handleDecline(booking.id)}
                    disabled={actionLoading === booking.id}
                    className="bg-gray-800 px-6 py-2 rounded-full"
                  >
                    <Text className="text-red-500">Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleAccept(booking)}
                    className="bg-blue-600 px-6 py-2 rounded-full"
                  >
                    <Text className="text-white font-semibold">Accept Request</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}