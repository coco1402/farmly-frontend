import { Platform } from 'react-native';

// API 配置文件
const isDevelopment = __DEV__;  // React Native 自动提供

// Get the appropriate local API URL based on platform
const getLocalApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';  // Android emulator
  } else {
    // For iOS simulator or physical device, use your computer's IP
    return 'http://192.168.1.107:3000/api';  // Your Mac's IP address
  }
};

export const API_BASE_URL = isDevelopment
  ? getLocalApiUrl()
  : 'https://farmly.onrender.com/api';    // 生产环境

export default API_BASE_URL;