import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import api from '../../services/api';

export default function ClientBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/client/bookings');
      setBookings(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchBookings(); };

  const renderItem = ({ item }) => {
    const canRate = item.status === 'COMPLETED' && item.review === null;
    return (
      <View className="bg-gray-900 p-4 rounded-2xl mb-4">
        <Text className="text-white font-bold">{item.artisan.name}</Text>
        <Text className="text-gray-400 text-sm">{item.serviceType} • {new Date(item.scheduledDate).toLocaleDateString()}</Text>
        <Text className={`text-xs mt-1 ${item.status === 'PENDING' ? 'text-yellow-500' : item.status === 'COMPLETED' ? 'text-green-500' : 'text-blue-500'}`}>
          {item.status}
        </Text>
        {canRate && (
          <TouchableOpacity
            onPress={() => navigation.navigate('RateArtisan', { booking: item })}
            className="bg-blue-600 py-2 px-4 rounded-full mt-3 self-start"
          >
            <Text className="text-white font-semibold">Rate Artisan</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) return <View className="flex-1 bg-black justify-center items-center"><ActivityIndicator color="white" /></View>;
  return (
    <FlatList
      data={bookings}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      className="px-4 pt-6"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
      ListEmptyComponent={<Text className="text-gray-400 text-center mt-10">No bookings yet</Text>}
    />
  );
}