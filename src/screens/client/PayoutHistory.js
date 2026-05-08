import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../../services/api';

export default function PayoutHistory({ navigation }) {
  const [activeTab, setActiveTab] = useState('30days'); // '30days', 'alltime', 'service'
  const [withdrawals, setWithdrawals] = useState([]);
  const [netEarnings, setNetEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await api.get('/withdrawal/requests');
      setWithdrawals(response.data.data);
      // Calculate net earnings (sum of completed withdrawals)
      const total = response.data.data
        .filter(w => w.status === 'COMPLETED')
        .reduce((sum, w) => sum + w.amount, 0);
      setNetEarnings(total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-500';
      case 'PROCESSING': return 'text-yellow-500';
      case 'FAILED': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  };

  const renderItem = ({ item }) => (
    <View className="bg-gray-900 rounded-xl p-4 mb-3">
      <View className="flex-row justify-between items-center mb-1">
        <Text className={`text-xs font-bold ${getStatusColor(item.status)}`}>{item.status}</Text>
        <Text className="text-gray-500 text-xs">{formatDate(item.createdAt)}</Text>
      </View>
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-white font-semibold">{item.bankAccount?.bankName || 'Bank'}</Text>
          <Text className="text-gray-400 text-xs">●●●●{item.bankAccount?.accountNumber?.slice(-4) || '****'}</Text>
        </View>
        <Text className="text-white font-bold text-lg">₦{item.amount.toLocaleString()}</Text>
      </View>
    </View>
  );

  if (loading) return <View className="flex-1 bg-black justify-center items-center"><ActivityIndicator color="white" /></View>;

  return (
    <View className="flex-1 bg-black px-4 pt-6">
      <Text className="text-white text-2xl font-bold mb-4">Payout History</Text>

      {/* Tabs */}
      <View className="flex-row justify-between mb-6">
        <TouchableOpacity onPress={() => setActiveTab('30days')} className={`py-2 px-4 rounded-full ${activeTab === '30days' ? 'bg-blue-600' : 'bg-gray-800'}`}>
          <Text className={`${activeTab === '30days' ? 'text-white' : 'text-gray-400'}`}>Last 30 Days</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('alltime')} className={`py-2 px-4 rounded-full ${activeTab === 'alltime' ? 'bg-blue-600' : 'bg-gray-800'}`}>
          <Text className={`${activeTab === 'alltime' ? 'text-white' : 'text-gray-400'}`}>All Time</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('service')} className={`py-2 px-4 rounded-full ${activeTab === 'service' ? 'bg-blue-600' : 'bg-gray-800'}`}>
          <Text className={`${activeTab === 'service' ? 'text-white' : 'text-gray-400'}`}>Service Type</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={withdrawals}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text className="text-gray-400 text-center mt-10">No withdrawals yet</Text>}
      />

      {/* Net Earnings Summary */}
      <View className="bg-gray-900 rounded-xl p-4 mt-4 mb-8">
        <Text className="text-gray-400 text-sm text-center">NET EARNINGS</Text>
        <Text className="text-white text-2xl font-bold text-center mt-1">₦{netEarnings.toLocaleString()}</Text>
        <Text className="text-gray-500 text-xs text-center">Last 30 days</Text>
      </View>
    </View>
  );
}