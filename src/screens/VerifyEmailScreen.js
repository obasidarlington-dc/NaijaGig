import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { registerForPushNotificationsAsync } from '../services/notifications'; // 👈 import

export default function VerifyEmailScreen({ route, navigation }) {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (text, index) => {
    if (text && !/^\d+$/.test(text)) return;
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter complete 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-email', { email, code: otpCode });
      const { token, user } = response.data.data;

      await AsyncStorage.setItem('authToken', token);
      await registerForPushNotificationsAsync(); // 👈 register push token

      Alert.alert('Success', 'Email verified successfully!', [
        {
          text: 'OK',
          onPress: () => {
            if (user.role === 'ARTISAN') {
              navigation.replace('MainApp');
            } else {
              navigation.replace('ClientApp');
            }
          }
        }
      ]);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Verification failed. Please try again.';
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await api.post('/auth/resend-code', { email });
      Alert.alert('Success', 'New verification code sent to your email');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to resend code');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 pt-16">
          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-6">
              <MaterialCommunityIcons name="email-check-outline" size={40} color="white" />
            </View>
            <Text className="text-white text-2xl font-bold mb-2">Verify Your Email</Text>
            <Text className="text-gray-400 text-center text-base">We've sent a 6-digit code to</Text>
            <Text className="text-white text-base font-semibold mt-1">{email}</Text>
          </View>

          <View className="flex-row justify-between mb-8">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                className={`w-12 h-14 bg-gray-800 rounded-lg text-white text-center text-xl font-bold ${
                  digit ? 'border-2 border-blue-600' : 'border border-gray-700'
                }`}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          <View className="items-center mb-8">
            {countdown > 0 ? (
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="timer-outline" size={20} color="#9CA3AF" />
                <Text className="text-gray-400 ml-2">Resend code in {countdown}s</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={handleResend} className="flex-row items-center">
                <MaterialCommunityIcons name="refresh" size={20} color="#2563EB" />
                <Text className="text-blue-600 ml-2 font-semibold">Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className={`py-4 rounded-lg mb-6 ${
              loading || otp.join('').length !== 6 ? 'bg-gray-700' : 'bg-blue-600'
            }`}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-bold text-lg">Verify Email</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} className="items-center">
            <Text className="text-gray-400">Wrong email? <Text className="text-blue-600 font-semibold">Change it</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView
// } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import api from '../services/api';

// export default function VerifyEmailScreen({ route, navigation }) {
//   const { email } = route.params;

//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [loading, setLoading] = useState(false);
//   const [countdown, setCountdown] = useState(60);
//   const [canResend, setCanResend] = useState(false);

//   const inputRefs = useRef([]);

//   useEffect(() => {
//     if (countdown > 0) {
//       const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
//       return () => clearTimeout(timer);
//     } else {
//       setCanResend(true);
//     }
//   }, [countdown]);

//   const handleOtpChange = (text, index) => {
//     if (text && !/^\d+$/.test(text)) return;
//     const newOtp = [...otp];
//     newOtp[index] = text;
//     setOtp(newOtp);
//     if (text && index < 5) {
//       inputRefs.current[index + 1]?.focus();
//     }
//   };

//   const handleKeyPress = (e, index) => {
//     if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     }
//   };

//   const handleVerify = async () => {
//     const otpCode = otp.join('');
//     if (otpCode.length !== 6) {
//       Alert.alert('Error', 'Please enter complete 6-digit code');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await api.post('/auth/verify-email', { email, code: otpCode });
//       const { token, user } = response.data.data;

//       // ✅ Store token for authenticated requests
//       await AsyncStorage.setItem('authToken', token);

//       Alert.alert('Success', 'Email verified successfully!', [
//         {
//           text: 'OK',
//           onPress: () => {
//             // ✅ Navigate based on role
//             if (user.role === 'ARTISAN') {
//               navigation.replace('MainApp');
//             } else {
//               navigation.replace('ClientApp');
//             }
//           }
//         }
//       ]);
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 'Verification failed. Please try again.';
//       Alert.alert('Verification Failed', errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     if (!canResend) return;
//     try {
//       await api.post('/auth/resend-code', { email });
//       Alert.alert('Success', 'New verification code sent to your email');
//       setCountdown(60);
//       setCanResend(false);
//       setOtp(['', '', '', '', '', '']);
//       inputRefs.current[0]?.focus();
//     } catch (error) {
//       Alert.alert('Error', error.response?.data?.error || 'Failed to resend code');
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       className="flex-1 bg-black"
//     >
//       <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
//         <View className="flex-1 px-6 pt-16">
//           <View className="items-center mb-12">
//             <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-6">
//               <MaterialCommunityIcons name="email-check-outline" size={40} color="white" />
//             </View>
//             <Text className="text-white text-2xl font-bold mb-2">Verify Your Email</Text>
//             <Text className="text-gray-400 text-center text-base">We've sent a 6-digit code to</Text>
//             <Text className="text-white text-base font-semibold mt-1">{email}</Text>
//           </View>

//           <View className="flex-row justify-between mb-8">
//             {otp.map((digit, index) => (
//               <TextInput
//                 key={index}
//                 ref={(ref) => (inputRefs.current[index] = ref)}
//                 className={`w-12 h-14 bg-gray-800 rounded-lg text-white text-center text-xl font-bold ${
//                   digit ? 'border-2 border-blue-600' : 'border border-gray-700'
//                 }`}
//                 value={digit}
//                 onChangeText={(text) => handleOtpChange(text, index)}
//                 onKeyPress={(e) => handleKeyPress(e, index)}
//                 keyboardType="number-pad"
//                 maxLength={1}
//                 selectTextOnFocus
//                 autoFocus={index === 0}
//               />
//             ))}
//           </View>

//           <View className="items-center mb-8">
//             {countdown > 0 ? (
//               <View className="flex-row items-center">
//                 <MaterialCommunityIcons name="timer-outline" size={20} color="#9CA3AF" />
//                 <Text className="text-gray-400 ml-2">Resend code in {countdown}s</Text>
//               </View>
//             ) : (
//               <TouchableOpacity onPress={handleResend} className="flex-row items-center">
//                 <MaterialCommunityIcons name="refresh" size={20} color="#2563EB" />
//                 <Text className="text-blue-600 ml-2 font-semibold">Resend Code</Text>
//               </TouchableOpacity>
//             )}
//           </View>

//           <TouchableOpacity
//             onPress={handleVerify}
//             disabled={loading || otp.join('').length !== 6}
//             className={`py-4 rounded-lg mb-6 ${
//               loading || otp.join('').length !== 6 ? 'bg-gray-700' : 'bg-blue-600'
//             }`}
//           >
//             {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-bold text-lg">Verify Email</Text>}
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => navigation.goBack()} className="items-center">
//             <Text className="text-gray-400">
//               Wrong email? <Text className="text-blue-600 font-semibold">Change it</Text>
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }