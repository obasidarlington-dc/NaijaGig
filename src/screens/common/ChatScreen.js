import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

const SOCKET_URL = __DEV__ ? 'http://10.191.121.196:3000' : 'https://your-production.com';

export default function ChatScreen({ route, navigation }) {
  const { conversationId, otherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const socket = useRef(null);
  const flatListRef = useRef();

  // Get current user role
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        setCurrentUserRole(res.data.data.user.role);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMe();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initSocket = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;
      if (!socket.current) {
        socket.current = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket'],
        });
        socket.current.on('connect', () => {
          socket.current.emit('join_conversation', conversationId);
        });
        socket.current.on('new_message', (msg) => {
          if (isMounted) {
            setMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        });
      }
      await fetchMessages();
    };
    initSocket();
    return () => {
      isMounted = false;
      if (socket.current) {
        socket.current.off('new_message');
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/messages/${conversationId}`);
      if (response.data.success) {
        setMessages(response.data.data);
        await api.post(`/chat/messages/read/${conversationId}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    socket.current.emit('send_message', { conversationId, content: newMessage });
    setNewMessage('');
  };

  const renderMessage = ({ item }) => {
    // Determine if the message sender is an artisan
    // We need to know the sender's role. If the senderId matches the otherUser.id, use otherUser.role.
    // Otherwise, use currentUserRole.
    let isArtisan = false;
    if (item.senderId === otherUser.id) {
      isArtisan = otherUser.role === 'ARTISAN';
    } else {
      isArtisan = currentUserRole === 'ARTISAN';
    }
    // Artisan on left, client on right
    const isLeft = isArtisan;
    const bubbleColor = isArtisan ? 'bg-cyan-600' : 'bg-blue-600';
    const alignClass = isLeft ? 'justify-start' : 'justify-end';
    const avatarSource = isLeft ? otherUser?.profileImage : null; // For left, show other's avatar

    return (
      <View className={`flex-row ${alignClass} mb-4 px-2`}>
        {isLeft && (
          <Image
            source={{ uri: otherUser?.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg' }}
            className="w-8 h-8 rounded-full mr-2 self-end"
          />
        )}
        <View className={`max-w-[75%] ${isLeft ? 'items-start' : 'items-end'}`}>
          <View className={`p-3 rounded-2xl ${bubbleColor} ${isLeft ? 'rounded-bl-sm' : 'rounded-br-sm'}`}>
            <Text className="text-white text-base">{item.content}</Text>
          </View>
          <Text className={`text-xs mt-1 ${isLeft ? 'text-gray-500' : 'text-blue-300'}`}>
            {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>
        {!isLeft && (
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
            className="w-8 h-8 rounded-full ml-2 self-end"
          />
        )}
      </View>
    );
  };

  if (loading || !currentUserRole) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="white" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View className="flex-row items-center p-4 border-b border-gray-800">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Image source={{ uri: otherUser?.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg' }} className="w-10 h-10 rounded-full mr-3" />
          <View>
            <Text className="text-white font-bold">{otherUser?.name || 'User'}</Text>
            <Text className="text-gray-400 text-xs">{otherUser?.role === 'ARTISAN' ? 'Artisan' : 'Client'} • Online</Text>
          </View>
        </View>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          className="flex-1 px-4 pt-4"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
        <View className="flex-row items-center p-4 border-t border-gray-800 bg-black">
          <TextInput
            className="flex-1 bg-gray-800 rounded-full px-4 py-3 text-white"
            placeholder="Type a message..."
            placeholderTextColor="#6B7280"
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <TouchableOpacity onPress={sendMessage} className="ml-2 bg-blue-600 p-3 rounded-full">
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}