import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../../services/api';

export default function BankSetupScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    fetchBankAccount();
  }, []);

  const fetchBankAccount = async () => {
    try {
      const res = await api.get('/withdrawal/bank-account');
      if (res.data.data) {
        setAccountName(res.data.data.accountName);
        setBankName(res.data.data.bankName);
        setAccountNumber(res.data.data.accountNumber);
        setHasAccount(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!accountName || !bankName || !accountNumber) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    setSaving(true);
    try {
      await api.post('/withdrawal/bank-account', { accountName, bankName, accountNumber });
      Alert.alert('Success', 'Bank account saved');
      setHasAccount(true);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert('Confirm', 'Delete bank account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete('/withdrawal/bank-account');
            setHasAccount(false);
            setAccountName('');
            setBankName('');
            setAccountNumber('');
            Alert.alert('Deleted', 'Bank account removed');
          } catch (error) {
            Alert.alert('Error', 'Could not delete');
          }
        },
      },
    ]);
  };

  if (loading) return <View className="flex-1 bg-black justify-center items-center"><ActivityIndicator color="white" /></View>;

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-6">
      <Text className="text-white text-2xl font-bold mb-2">Bank Account</Text>
      <Text className="text-gray-400 mb-6">Add your bank details for withdrawals</Text>

      <Text className="text-gray-400 text-sm mb-2">ACCOUNT NAME</Text>
      <TextInput
        className="bg-gray-800 rounded-xl p-4 text-white mb-4"
        placeholder="Full name on account"
        placeholderTextColor="#6B7280"
        value={accountName}
        onChangeText={setAccountName}
        editable={!hasAccount}
      />

      <Text className="text-gray-400 text-sm mb-2">BANK NAME</Text>
      <TextInput
        className="bg-gray-800 rounded-xl p-4 text-white mb-4"
        placeholder="e.g., GTBank"
        placeholderTextColor="#6B7280"
        value={bankName}
        onChangeText={setBankName}
        editable={!hasAccount}
      />

      <Text className="text-gray-400 text-sm mb-2">ACCOUNT NUMBER</Text>
      <TextInput
        className="bg-gray-800 rounded-xl p-4 text-white mb-6"
        placeholder="10 digits"
        placeholderTextColor="#6B7280"
        keyboardType="numeric"
        value={accountNumber}
        onChangeText={setAccountNumber}
        editable={!hasAccount}
      />

      {!hasAccount ? (
        <TouchableOpacity onPress={handleSave} disabled={saving} className="bg-blue-600 py-4 rounded-xl">
          {saving ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-bold">Save Account</Text>}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleDelete} className="bg-red-600 py-4 rounded-xl">
          <Text className="text-white text-center font-bold">Delete Account</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}