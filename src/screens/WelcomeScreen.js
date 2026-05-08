import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const BG_IMAGE = {
  uri: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
};


export default function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground source={BG_IMAGE} style={{ flex: 1 }} resizeMode="cover">
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)', '#000000']}
        locations={[0.3, 0.6, 1]}
        style={{ flex: 1 }}
      >
        {/* Logo — centered at top */}
        <View style={{ alignItems: 'center', paddingTop: 64, gap: 6 }}>
          <View style={{
            width: 48, height: 48, backgroundColor: '#2563EB',
            borderRadius: 12, alignItems: 'center', justifyContent: 'center',
          }}>
            <MaterialCommunityIcons name="hammer-wrench" size={26} color="white" />
          </View>
          <Text style={{
            color: 'white', fontSize: 22, fontWeight: '800',
            letterSpacing: 3, textAlign: 'center',
          }}>
            ProxiCraft
          </Text>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Bottom content */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 48 }}>

          {/* Badge */}
          <View style={{
            alignSelf: 'flex-start',
            backgroundColor: 'rgba(37,99,235,0.25)',
            borderWidth: 0.5, borderColor: 'rgba(96,165,250,0.4)',
            borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
            marginBottom: 14,
          }}>
            <Text style={{ color: '#93C5FD', fontSize: 11, letterSpacing: 1 }}>
              NIGERIA'S ARTISAN NETWORK
            </Text>
          </View>

          <Text style={{ color: 'white', fontSize: 30, fontWeight: '500', lineHeight: 38, marginBottom: 10 }}>
            Find skilled pros,{'\n'}get work done.
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 20, marginBottom: 28 }}>
            Electricians, plumbers, welders & more —{'\n'}verified and ready near you.
          </Text>

          {/* Find a Pro */}
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp', { role: 'CLIENT' })}
            style={{
              backgroundColor: '#2563EB', borderRadius: 14,
              paddingVertical: 15, alignItems: 'center', marginBottom: 10,
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Find a Pro</Text>
          </TouchableOpacity>

          {/* Join as Artisan */}
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp', { role: 'ARTISAN' })}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
              borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 4,
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Join as Artisan</Text>
          </TouchableOpacity>

          {/* Sign In */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={{ paddingVertical: 12, alignItems: 'center' }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
              Already have an account?{' '}
              <Text style={{ color: 'white', fontWeight: '600' }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}