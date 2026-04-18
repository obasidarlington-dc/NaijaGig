import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      <View className="flex-1 px-6 pt-12">
        {/* Logo */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-3 shadow-lg">
            <MaterialCommunityIcons 
              name="hammer-wrench" 
              size={34} 
              color="#1E40AF" 
            />
          </View>
          <Text className="text-white text-3xl font-bold tracking-wider">
            NAIJAGIG
          </Text>
        </View>

        {/* Hero Image */}
        <View className="flex-1 items-center justify-center mb-8">
          {/* Main illustration container */}
          <View className="w-full aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden relative shadow-2xl">
            {/* Main artisan icon */}
            <View className="absolute inset-0 items-center justify-center">
              <MaterialCommunityIcons 
                name="account-hard-hat" 
                size={120} 
                color="rgba(255,255,255,0.15)" 
              />
              <Text className="text-white/40 text-sm mt-6 font-medium">
                Premium Artisan Services
              </Text>
            </View>

            {/* Floating icons with glow effect */}
            <View className="absolute top-4 right-4 w-14 h-14 bg-white rounded-xl items-center justify-center shadow-xl">
              <Ionicons 
                name="flash" 
                size={28} 
                color="#EAB308" 
              />
            </View>
            
            <View className="absolute bottom-4 right-4 w-14 h-14 bg-gray-900 rounded-xl items-center justify-center border border-gray-700 shadow-xl">
              <Ionicons 
                name="checkmark-circle" 
                size={28} 
                color="#10B981" 
              />
            </View>
            
            <View className="absolute bottom-4 left-4 w-14 h-14 bg-blue-600 rounded-xl items-center justify-center shadow-xl">
              <MaterialCommunityIcons 
                name="toolbox" 
                size={28} 
                color="white" 
              />
            </View>

            {/* Additional decorative icons */}
            <View className="absolute top-1/2 left-6 w-10 h-10 bg-gray-700/50 rounded-lg items-center justify-center">
              <MaterialCommunityIcons 
                name="screwdriver" 
                size={20} 
                color="rgba(255,255,255,0.6)" 
              />
            </View>

            <View className="absolute top-1/3 right-6 w-10 h-10 bg-gray-700/50 rounded-lg items-center justify-center">
              <MaterialCommunityIcons 
                name="wrench" 
                size={20} 
                color="rgba(255,255,255,0.6)" 
              />
            </View>
          </View>
        </View>

        {/* Title & Description */}
        <View className="mb-8">
          <Text className="text-white text-3xl font-bold text-center mb-3">
            Premium Artisan{'\n'}Marketplace
          </Text>
          <Text className="text-gray-400 text-center text-base leading-6">
            Experience elite craftsmanship.{'\n'}
            Connect with Nigeria's most skilled{'\n'}
            professionals.
          </Text>
        </View>

        {/* Buttons */}
        <View className="mb-8">
          {/* Get Started Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp', { role: 'CLIENT' })}
            className="bg-blue-600 rounded-2xl py-4 mb-4"
            activeOpacity={0.8}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Get Started
            </Text>
          </TouchableOpacity>

          {/* I'm an Artisan Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp', { role: 'ARTISAN' })}
            className="border-2 border-blue-600 rounded-2xl py-4"
            activeOpacity={0.8}
          >
            <Text className="text-blue-600 text-center text-lg font-semibold">
              I'm an Artisan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Log In Button (new) */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            className="bg-gray-800 rounded-2xl py-4 mb-4"
            activeOpacity={0.8}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Log In
            </Text>
          </TouchableOpacity>

        {/* Bottom indicator */}
        <View className="items-center pb-6">
          <View className="w-32 h-1 bg-gray-700 rounded-full" />
        </View>
      </View>
    </SafeAreaView>
  );
}