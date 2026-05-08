// import React, { useState, useEffect } from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Switch, Image, RefreshControl } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import api from '../../services/api';

// export default function DashboardScreen({ navigation }) {
//   const [isOnline, setIsOnline] = useState(true);
//   const [userName, setUserName] = useState('Artisan');
//   const [stats, setStats] = useState({ totalJobs: 0, averageRating: 0, totalEarnings: 0, pendingRequests: 0 });
//   const [pendingBookings, setPendingBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   // Fetch logged-in artisan's name
//   const fetchUserProfile = async () => {
//     try {
//       const response = await api.get('/auth/me');
//       if (response.data.success) {
//         const fullName = response.data.data.user.name;
//         const firstName = fullName.split(' ')[0];
//         setUserName(firstName);
//       }
//     } catch (error) {
//       console.error('Error fetching profile:', error);
//     }
//   };

//   const fetchData = async () => {
//     try {
//       const [statsRes, bookingsRes] = await Promise.all([
//         api.get('/artisan/dashboard'),
//         api.get('/artisan/bookings?status=pending'),
//       ]);
//       setStats(statsRes.data.data);
//       setPendingBookings(bookingsRes.data.data);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     const loadAll = async () => {
//       await fetchUserProfile();
//       await fetchData();
//     };
//     loadAll();
//   }, []);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchUserProfile();
//     await fetchData();
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 bg-black justify-center items-center">
//         <Text className="text-white">Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView
//       className="flex-1 bg-black px-4 pt-6"
//       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
//     >
//       {/* Welcome header */}
//       <View className="flex-row justify-between items-center mb-6">
//         <View>
//           <Text className="text-gray-400 text-sm">WELCOME BACK,</Text>
//           <Text className="text-white text-2xl font-bold">{userName}</Text>
//         </View>
//         <View className="bg-gray-800 p-2 rounded-full">
//           <Ionicons name="notifications-outline" size={24} color="white" />
//         </View>
//       </View>

//       {/* Stats cards */}
//       <View className="flex-row justify-between mb-6">
//         <View className="bg-gray-900 rounded-2xl p-4 flex-1 mr-2">
//           <Text className="text-gray-400 text-xs">JOBS</Text>
//           <Text className="text-white text-2xl font-bold">{stats.totalJobs}</Text>
//         </View>
// <View className="bg-gray-900 rounded-2xl p-4 flex-1 mx-2">
//   <Text className="text-gray-400 text-xs">RATING</Text>
//   <View className="flex-row items-center">
//     <Text className="text-white text-2xl font-bold mr-1">
//       {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
//     </Text>
//     <Ionicons name="star" size={16} color="#F59E0B" />
//   </View>
// </View>

//         <View className="bg-gray-900 rounded-2xl p-4 flex-1 ml-2">
//           <Text className="text-gray-400 text-xs">EARNINGS</Text>
//           <Text className="text-white text-2xl font-bold">₦{stats.totalEarnings.toLocaleString()}</Text>
//         </View>
//       </View>

//       {/* Online Status Toggle */}
//       <View className="flex-row justify-between items-center bg-gray-900 rounded-2xl p-4 mb-6">
//         <View>
//           <Text className="text-white font-semibold">Online Status</Text>
//           <Text className="text-gray-400 text-xs">Visible to potential clients</Text>
//         </View>
//         <Switch
//           value={isOnline}
//           onValueChange={setIsOnline}
//           trackColor={{ false: '#374151', true: '#2563EB' }}
//           thumbColor={isOnline ? '#FFFFFF' : '#9CA3AF'}
//         />
//       </View>

//       {/* Pending Requests Header */}
//       <View className="flex-row justify-between items-center mb-4">
//         <View className="flex-row items-center">
//           <Text className="text-white text-lg font-bold">Pending Requests</Text>
//           {stats.pendingRequests > 0 && (
//             <View className="bg-red-500 rounded-full px-2 ml-2">
//               <Text className="text-white text-xs font-bold">{stats.pendingRequests} NEW</Text>
//             </View>
//           )}
//         </View>
//         <TouchableOpacity onPress={() => navigation.navigate('Requests')}>
//           <Text className="text-blue-500">View All</Text>
//         </TouchableOpacity>
//       </View>

//       {pendingBookings.map((booking) => (
//         <View key={booking.id} className="bg-gray-900 rounded-2xl p-4 mb-4">
//           <View className="flex-row items-center mb-3">
//             <Image
//               source={{ uri: booking.client?.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg' }}
//               className="w-12 h-12 rounded-full mr-3"
//             />
//             <View className="flex-1">
//               <Text className="text-white font-bold">{booking.client?.name || 'Client'}</Text>
//               <Text className="text-gray-400 text-xs">{booking.address?.split(',')[0] || 'Address not set'}</Text>
//             </View>
//             <Text className="text-blue-500 font-bold">₦{booking.estimatedPrice?.toLocaleString()}</Text>
//           </View>
//           <Text className="text-gray-300 text-sm mb-4">{booking.description}</Text>
//           <View className="flex-row justify-end space-x-3">
//             <TouchableOpacity
//               className="bg-gray-800 px-6 py-2 rounded-full"
//               onPress={async () => {
//                 await api.post(`/artisan/bookings/${booking.id}/decline`);
//                 fetchData();
//               }}
//             >
//               <Text className="text-red-500">Decline</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               className="bg-blue-600 px-6 py-2 rounded-full"
//               onPress={() => navigation.navigate('AcceptBooking', { booking })}
//             >
//               <Text className="text-white font-semibold">Accept Job</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       ))}

//       {/* Active Jobs Section */}
//       <Text className="text-white text-lg font-bold mb-4">Active Jobs</Text>
//       <TouchableOpacity
//         onPress={() => navigation.navigate('Active')}
//         className="bg-gray-900 rounded-2xl p-4 mb-8"
//       >
//         <Text className="text-blue-500 text-center">View all active jobs →</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function DashboardScreen({ navigation }) {
  const [isOnline, setIsOnline] = useState(true);
  const [userName, setUserName] = useState('Artisan');
  const [stats, setStats] = useState({ totalJobs: 0, averageRating: 0, totalEarnings: 0, pendingRequests: 0 });
  const [pendingBookings, setPendingBookings] = useState([]);
  const [recentCompleted, setRecentCompleted] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        const fullName = response.data.data.user.name;
        const firstName = fullName.split(' ')[0];
        setUserName(firstName);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [statsRes, bookingsRes, completedRes] = await Promise.all([
        api.get('/artisan/dashboard'),
        api.get('/artisan/bookings?status=pending'),
        api.get('/artisan/bookings?status=completed&limit=1'), // get most recent completed
      ]);
      setStats(statsRes.data.data);
      setPendingBookings(bookingsRes.data.data);
      if (completedRes.data.data && completedRes.data.data.length > 0) {
        setRecentCompleted(completedRes.data.data[0]);
      } else {
        setRecentCompleted(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh when screen comes into focus (after completing a job)
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  useEffect(() => {
    const loadAll = async () => {
      await fetchUserProfile();
      await fetchData();
    };
    loadAll();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    await fetchData();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  const hasActiveOrPending = (stats.pendingRequests > 0) || (stats.activeJobs > 0);

  return (
    <ScrollView
      className="flex-1 bg-black px-4 pt-6"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
    >
      {/* Welcome header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-gray-400 text-sm">WELCOME BACK,</Text>
          <Text className="text-white text-2xl font-bold">{userName}</Text>
        </View>
        <View className="bg-gray-800 p-2 rounded-full">
          <Ionicons name="notifications-outline" size={24} color="white" />
        </View>
      </View>

      {/* Stats cards */}
      <View className="flex-row justify-between mb-6">
        <View className="bg-gray-900 rounded-2xl p-4 flex-1 mr-2">
          <Text className="text-gray-400 text-xs">JOBS</Text>
          <Text className="text-white text-2xl font-bold">{stats.totalJobs}</Text>
        </View>
        <View className="bg-gray-900 rounded-2xl p-4 flex-1 mx-2">
          <Text className="text-gray-400 text-xs">RATING</Text>
          <View className="flex-row items-center">
            <Text className="text-white text-2xl font-bold mr-1">
              {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
            </Text>
            <Ionicons name="star" size={16} color="#F59E0B" />
          </View>
        </View>
        <View className="bg-gray-900 rounded-2xl p-4 flex-1 ml-2">
          <Text className="text-gray-400 text-xs">EARNINGS</Text>
          <Text className="text-white text-2xl font-bold">
            ₦{stats.totalEarnings.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Online Status Toggle */}
      <View className="flex-row justify-between items-center bg-gray-900 rounded-2xl p-4 mb-6">
        <View>
          <Text className="text-white font-semibold">Online Status</Text>
          <Text className="text-gray-400 text-xs">Visible to potential clients</Text>
        </View>
        <Switch
          value={isOnline}
          onValueChange={setIsOnline}
          trackColor={{ false: '#374151', true: '#2563EB' }}
          thumbColor={isOnline ? '#FFFFFF' : '#9CA3AF'}
        />
      </View>

      {/* Pending Requests Section */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <Text className="text-white text-lg font-bold">Pending Requests</Text>
          {stats.pendingRequests > 0 && (
            <View className="bg-red-500 rounded-full px-2 ml-2">
              <Text className="text-white text-xs font-bold">{stats.pendingRequests} NEW</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Requests')}>
          <Text className="text-blue-500">View All</Text>
        </TouchableOpacity>
      </View>

      {pendingBookings.length > 0 ? (
        pendingBookings.map((booking) => (
          <View key={booking.id} className="bg-gray-900 rounded-2xl p-4 mb-4">
            {/* booking card content same as before */}
            <View className="flex-row items-center mb-3">
              <Image
                source={{ uri: booking.client?.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg' }}
                className="w-12 h-12 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text className="text-white font-bold">{booking.client?.name || 'Client'}</Text>
                <Text className="text-gray-400 text-xs">{booking.address?.split(',')[0] || 'Address not set'}</Text>
              </View>
              <Text className="text-blue-500 font-bold">₦{booking.estimatedPrice?.toLocaleString()}</Text>
            </View>
            <Text className="text-gray-300 text-sm mb-4">{booking.description}</Text>
            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                className="bg-gray-800 px-6 py-2 rounded-full"
                onPress={async () => {
                  await api.post(`/artisan/bookings/${booking.id}/decline`);
                  fetchData();
                }}
              >
                <Text className="text-red-500">Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-600 px-6 py-2 rounded-full"
                onPress={() => navigation.navigate('AcceptBooking', { booking })}
              >
                <Text className="text-white font-semibold">Accept Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        // If no pending requests, show a friendly message
        <View className="bg-gray-900 rounded-2xl p-4 mb-4 items-center">
          <Ionicons name="checkmark-circle" size={40} color="#10B981" />
          <Text className="text-gray-400 text-center mt-2">No pending requests</Text>
        </View>
      )}

      {/* Active Jobs Section */}
      <Text className="text-white text-lg font-bold mb-4">Active Jobs</Text>
      {stats.activeJobs > 0 ? (
        <TouchableOpacity
          onPress={() => navigation.navigate('Active')}
          className="bg-gray-900 rounded-2xl p-4 mb-4"
        >
          <Text className="text-blue-500 text-center">View {stats.activeJobs} active job(s) →</Text>
        </TouchableOpacity>
      ) : (
        <View className="bg-gray-900 rounded-2xl p-4 mb-4 items-center">
          <Ionicons name="briefcase-outline" size={40} color="#6B7280" />
          <Text className="text-gray-400 text-center mt-2">No active jobs</Text>
        </View>
      )}

      {/* Recent Completed Job (only shown if no pending/active) */}
      {!hasActiveOrPending && recentCompleted && (
        <>
          <Text className="text-white text-lg font-bold mb-4">Recently Completed</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Active')} // or a completed jobs screen
            className="bg-gray-900 rounded-2xl p-4 mb-8"
          >
            <View className="flex-row items-center">
              <Image
                source={{ uri: recentCompleted.client?.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg' }}
                className="w-10 h-10 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text className="text-white font-bold">{recentCompleted.client?.name}</Text>
                <Text className="text-gray-400 text-xs">{recentCompleted.serviceType}</Text>
              </View>
              <Text className="text-green-500 font-bold">₦{recentCompleted.finalPrice?.toLocaleString()}</Text>
            </View>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}