import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';

export default function FilterModal({ visible, onClose, filters, setFilters }) {
  const [tempFilters, setTempFilters] = useState(filters);

  const categories = ['Electrician', 'Plumber', 'Carpenter', 'Tailor', 'Mechanic', 'Hairdresser', 'Painter'];
  const ratings = [1, 2, 3, 4, 5];

  const applyFilters = () => {
    setFilters(tempFilters);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/80 justify-end">
        <View className="bg-gray-900 rounded-t-3xl p-6 h-3/4">
          <Text className="text-white text-2xl font-bold mb-4">Filter Artisans</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-gray-400 mb-2">SERVICE CATEGORY</Text>
            <Picker
              selectedValue={tempFilters.category}
              onValueChange={(itemValue) => setTempFilters({ ...tempFilters, category: itemValue })}
              style={{ color: 'white', backgroundColor: '#1F2937', marginBottom: 16 }}
            >
              <Picker.Item label="All" value={null} />
              {categories.map(cat => <Picker.Item key={cat} label={cat} value={cat} />)}
            </Picker>

            <Text className="text-gray-400 mb-2">MINIMUM RATING</Text>
            <View className="flex-row mb-4">
              {ratings.map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setTempFilters({ ...tempFilters, minRating: r })}
                  className={`px-4 py-2 rounded-full mr-2 ${tempFilters.minRating === r ? 'bg-blue-600' : 'bg-gray-800'}`}
                >
                  <Text className="text-white">{r}+</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-gray-400 mb-2">MAX HOURLY RATE (₦)</Text>
            <Slider
              minimumValue={500}
              maximumValue={5000}
              step={100}
              value={tempFilters.maxPrice || 5000}
              onValueChange={(val) => setTempFilters({ ...tempFilters, maxPrice: val })}
              minimumTrackTintColor="#2563EB"
              maximumTrackTintColor="#374151"
              thumbTintColor="#2563EB"
            />
            <Text className="text-white mt-1">₦{tempFilters.maxPrice || 5000}</Text>
          </ScrollView>

          <View className="flex-row mt-6 space-x-4">
            <TouchableOpacity onPress={onClose} className="flex-1 bg-gray-800 py-3 rounded-xl">
              <Text className="text-white text-center">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={applyFilters} className="flex-1 bg-blue-600 py-3 rounded-xl">
              <Text className="text-white text-center font-bold">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}