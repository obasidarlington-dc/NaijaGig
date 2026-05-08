import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch, Modal, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import FilterModal from './FilterModal';

const categories = [
  { name: 'All', icon: 'apps-outline' },
  { name: 'Electrician', icon: 'flash-outline' },
  { name: 'Plumber', icon: 'water-outline' },
  { name: 'Carpenter', icon: 'hammer-outline' },
  { name: 'Painter', icon: 'color-palette-outline' },
  { name: 'Mechanic', icon: 'car-outline' }
];

export default function DiscoverScreen({ navigation }) {
  const [viewMode, setViewMode] = useState('list');
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: null, minRating: null, maxPrice: null });
  const [filterVisible, setFilterVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } else {
        setLocationError(true);
        setLocation({ lat: 6.5244, lng: 3.3792 });
      }
    })();
  }, []);

  useEffect(() => {
    if (location) fetchArtisans();
  }, [location, filters, searchQuery]);

  const fetchArtisans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        lat: location.lat,
        lng: location.lng,
        ...(filters.category && { category: filters.category }),
        ...(filters.minRating && { minRating: filters.minRating }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(searchQuery && { search: searchQuery }),
      });
      const response = await api.get(`/client/artisans?${params.toString()}`);
      setArtisans(response.data.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load artisans');
    } finally {
      setLoading(false);
    }
  };

  const renderArtisanCard = ({ item }) => (
    <TouchableOpacity
      className="bg-gray-900 rounded-2xl p-4 mb-3 flex-row"
      onPress={() => navigation.navigate('ArtisanProfile', { artisanId: item.id })}
    >
      <Image
        source={{ uri: item.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg' }}
        className="w-16 h-16 rounded-full mr-4"
      />
      <View className="flex-1">
        <Text className="text-white font-bold text-lg">{item.name}</Text>
        <Text className="text-gray-400 text-sm">{item.artisanProfile?.serviceCategory}</Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text className="text-gray-300 text-xs ml-1">
            {item.artisanProfile?.averageRating?.toFixed(1) || 'New'}
          </Text>
          <Text className="text-gray-500 text-xs ml-2">
            ❤️ {item.artisanProfile?.totalJobs || 0} jobs
          </Text>
          {item.distance && (
            <Text className="text-gray-500 text-xs ml-2">
              {item.distance.toFixed(1)} km away
            </Text>
          )}
        </View>
        <Text className="text-blue-500 font-bold mt-1">
          ₦{item.artisanProfile?.hourlyRate}/hr
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!location) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="white" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">

      {/* Search + Filter */}
      <View className="px-4 pt-6 pb-3 flex-row items-center">
        <View className="flex-1 bg-gray-800 rounded-full px-4 py-2 flex-row items-center mr-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-white ml-2"
            placeholder="Search by name or category..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          onPress={() => setFilterVisible(true)}
          className="bg-gray-800 p-3 rounded-full"
        >
          <Ionicons name="options-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Category Chips */}
      <ScrollView
      horizontal
  showsHorizontalScrollIndicator={false}
 className="px-4 pt-2 pb-0"
        contentContainerStyle={{ gap: 12, paddingBottom: 0 }}
      >
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.name}
            onPress={() =>
              setFilters({ ...filters, category: cat.name === 'All' ? null : cat.name })
            }
            className={`items-center justify-center w-16 h-16 rounded-xl ${
              filters.category === cat.name ? 'bg-blue-600' : 'bg-gray-800'
            }`}
          >
            <Ionicons
              name={cat.icon}
              size={24}
              color={filters.category === cat.name ? 'white' : '#9CA3AF'}
            />
            <Text
              className={`text-xs mt-1 ${
                filters.category === cat.name ? 'text-white' : 'text-gray-400'
              }`}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List / Map Toggle */}
      <View className="flex-row justify-end px-4 pt-0 pb-1">
        <TouchableOpacity
          onPress={() => setViewMode('list')}
          className={`p-2 ${viewMode === 'list' ? 'border-b-2 border-blue-600' : ''}`}
        >
          <Ionicons name="list" size={22} color={viewMode === 'list' ? '#2563EB' : '#6B7280'} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode('map')}
          className={`p-2 ml-2 ${viewMode === 'map' ? 'border-b-2 border-blue-600' : ''}`}
        >
          <Ionicons name="map" size={22} color={viewMode === 'map' ? '#2563EB' : '#6B7280'} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="white" size="large" />
        </View>
      ) : viewMode === 'list' ? (
        <FlatList
        className="px-4 -mt-2"
          data={artisans}
          renderItem={renderArtisanCard}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text className="text-gray-400 text-center mt-10">No artisans found</Text>
          }
        />
      ) : (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.lat,
            longitude: location.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {artisans.map(artisan =>
            artisan.artisanProfile?.latitude && artisan.artisanProfile?.longitude ? (
              <Marker
                key={artisan.id}
                coordinate={{
                  latitude: artisan.artisanProfile.latitude,
                  longitude: artisan.artisanProfile.longitude,
                }}
                title={artisan.name}
                description={artisan.artisanProfile.serviceCategory}
                onPress={() => navigation.navigate('ArtisanProfile', { artisanId: artisan.id })}
              />
            ) : null
          )}
        </MapView>
      )}

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </View>
  );
}