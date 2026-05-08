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

export default function ActiveJobsScreen({ navigation }) {
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // track which job is being acted upon

  const fetchActiveJobs = async () => {
    try {
      const response = await api.get('/artisan/bookings?status=active');
      setActiveJobs(response.data.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load active jobs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveJobs();
    // Refresh when screen comes into focus (e.g., after completing a job)
    const unsubscribe = navigation.addListener('focus', fetchActiveJobs);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchActiveJobs();
  }, []);

  const handleStartJob = async (jobId) => {
    setActionLoading(jobId);
    try {
      await api.post(`/artisan/bookings/${jobId}/start`);
      Alert.alert('Success', 'Job started!');
      fetchActiveJobs(); // refresh list
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to start job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompletePress = (job) => {
    navigation.navigate('JobCompletion', { job });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  if (activeJobs.length === 0) {
    return (
      <View className="flex-1 bg-black justify-center items-center px-6">
        <Ionicons name="briefcase-outline" size={64} color="#6B7280" />
        <Text className="text-gray-400 text-lg text-center mt-4">
          No active jobs
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          When you accept a booking, it will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <View className="px-4 pt-6 pb-2">
        <Text className="text-white text-2xl font-bold">Active Jobs</Text>
        <Text className="text-gray-400">{activeJobs.length} ongoing task{activeJobs.length !== 1 ? 's' : ''}</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-2"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
      >
        {activeJobs.map((job) => (
          <View key={job.id} className="bg-gray-900 rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-row items-center flex-1">
                <Image
                  source={{ uri: job.client?.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg' }}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <View>
                  <Text className="text-white font-bold">{job.client?.name || 'Client'}</Text>
                  <Text className={`text-xs ${job.status === 'IN_PROGRESS' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {job.status === 'IN_PROGRESS' ? 'IN PROGRESS' : 'ACCEPTED'}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400 text-xs">{job.address?.split(',')[0]}</Text>
            </View>

            <Text className="text-white font-semibold mt-2">{job.description || job.serviceType}</Text>
            <View className="flex-row mt-1">
              <Text className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full mr-2">
                {job.serviceType}
              </Text>
              {job.status === 'IN_PROGRESS' && (
                <Text className="bg-red-800 text-red-300 text-xs px-2 py-1 rounded-full">EMERGENCY</Text>
              )}
            </View>

            <View className="flex-row justify-between mt-3 mb-3">
              <Text className="text-blue-500 font-bold">₦{job.estimatedPrice?.toLocaleString()}</Text>
              <Text className="text-gray-400 text-xs">
                {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'Date TBD'}
              </Text>
            </View>

            {job.status === 'ACCEPTED' ? (
              <TouchableOpacity
                onPress={() => handleStartJob(job.id)}
                disabled={actionLoading === job.id}
                className={`py-2 rounded-full ${actionLoading === job.id ? 'bg-gray-600' : 'bg-blue-600'}`}
              >
                {actionLoading === job.id ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white text-center font-semibold">Start Job</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => handleCompletePress(job)}
                className="bg-green-600 py-2 rounded-full"
              >
                <Text className="text-white text-center font-semibold">Mark Complete</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}