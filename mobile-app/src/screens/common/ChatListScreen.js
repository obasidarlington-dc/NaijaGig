import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

export default function ChatListScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-800"
      onPress={() =>
        navigation.navigate('Chat', {
          conversationId: item.id,
          otherUser: item.otherUser,
          bookingId: item.bookingId,
        })
      }
    >
      <Image
        source={{ uri: item.otherUser?.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg' }}
        className="w-12 h-12 rounded-full mr-4"
      />
      <View className="flex-1">
        <Text className="text-white font-bold">{item.otherUser?.name || 'User'}</Text>
        <Text className="text-gray-400 text-sm" numberOfLines={1}>
          {item.lastMessage || 'Start a conversation'}
        </Text>
      </View>
      <Text className="text-gray-500 text-xs">
        {item.lastMessageTime
          ? new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : ''}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="white" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={
          <Text className="text-gray-400 text-center mt-10">No conversations yet</Text>
        }
      />
    </View>
  );
}