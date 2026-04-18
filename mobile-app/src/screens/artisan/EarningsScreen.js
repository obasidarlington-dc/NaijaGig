import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EarningsScreen() {
  return (
    <ScrollView className="flex-1 bg-black px-4 pt-6">
      <Text className="text-white text-2xl font-bold mb-4">Earnings</Text>
      <View className="bg-gray-900 rounded-2xl p-6 items-center mb-6">
        <Text className="text-gray-400 text-sm">Total Earnings</Text>
        <Text className="text-white text-4xl font-bold mt-1">₦82,450</Text>
        <Text className="text-green-500 text-sm mt-2">+12% from last month</Text>
      </View>
      <View className="bg-gray-900 rounded-2xl p-4">
        <Text className="text-white font-bold mb-2">Recent Transactions</Text>
        <View className="flex-row justify-between py-2 border-b border-gray-800">
          <Text className="text-gray-400">Kitchen Plumbing</Text>
          <Text className="text-green-500">+₦15,000</Text>
        </View>
        <View className="flex-row justify-between py-2 border-b border-gray-800">
          <Text className="text-gray-400">Electrical Re-wiring</Text>
          <Text className="text-green-500">+₦45,000</Text>
        </View>
        <View className="flex-row justify-between py-2">
          <Text className="text-gray-400">Cabinet Installation</Text>
          <Text className="text-green-500">+₦22,450</Text>
        </View>
      </View>
    </ScrollView>
  );
}