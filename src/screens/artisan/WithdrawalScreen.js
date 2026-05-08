import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
import api from '../../services/api';

export default function WithdrawalScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashboardRes, historyRes] = await Promise.all([
        api.get('/artisan/dashboard'),
        api.get('/withdrawal/requests'),
      ]);
      setBalance(dashboardRes.data.data.totalEarnings || 0);
      setHistory(historyRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Error', 'Enter a valid amount');
      return;
    }
    if (amt > balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/withdrawal/requests', { amount: amt });
      Alert.alert('Success', 'Withdrawal request submitted');
      setAmount('');
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderHistoryItem = ({ item }) => (
    <View className="bg-gray-900 p-4 rounded-xl mb-3">
      <View className="flex-row justify-between">
        <Text className="text-white font-bold">₦{item.amount.toLocaleString()}</Text>
        <Text className={`text-xs ${item.status === 'PENDING' ? 'text-yellow-500' : item.status === 'COMPLETED' ? 'text-green-500' : 'text-red-500'}`}>
          {item.status}
        </Text>
      </View>
      <Text className="text-gray-400 text-xs mt-1">{new Date(item.createdAt).toLocaleDateString()}</Text>
    </View>
  );

  if (loading) return <View className="flex-1 bg-black justify-center items-center"><ActivityIndicator color="white" /></View>;

  return (
    <View className="flex-1 bg-black px-4 pt-6">
      <Text className="text-white text-2xl font-bold mb-2">Withdraw Funds</Text>
      <Text className="text-gray-400 mb-4">Available balance: ₦{balance.toLocaleString()}</Text>

      <View className="bg-gray-800 rounded-xl p-4 mb-6">
        <Text className="text-gray-400 text-sm mb-2">AMOUNT (₦)</Text>
        <TextInput
          className="text-white text-xl"
          placeholder="0"
          placeholderTextColor="#6B7280"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <TouchableOpacity onPress={handleRequest} disabled={submitting} className="bg-blue-600 py-4 rounded-xl mb-8">
        {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-bold">Request Withdrawal</Text>}
      </TouchableOpacity>

      <Text className="text-white text-lg font-bold mb-3">History</Text>
      <FlatList data={history} renderItem={renderHistoryItem} keyExtractor={item => item.id} />
    </View>
  );
}