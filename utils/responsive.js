import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// 判断是否为 web 平台
export const isWeb = Platform.OS === 'web';

// 判断是否为小屏幕（手机）
export const isSmallDevice = width < 768;

// 判断是否为平板
export const isTablet = width >= 768 && width < 1024;

// 判断是否为桌面
export const isDesktop = width >= 1024;

// 获取响应式宽度百分比
export const wp = (percentage) => {
  return (width * percentage) / 100;
};

// 获取响应式高度百分比
export const hp = (percentage) => {
  return (height * percentage) / 100;
};

// 根据屏幕大小调整字体
export const fontSize = (size) => {
  if (isWeb && isDesktop) {
    return size * 1.2; // 桌面端稍大
  }
  if (isSmallDevice) {
    return size * 0.9; // 手机端稍小
  }
  return size;
};

// 根据平台返回不同的值
export const platformValue = (webValue, mobileValue) => {
  return isWeb ? webValue : mobileValue;
};

// 容器最大宽度（用于 web）
export const getMaxContainerWidth = () => {
  if (isWeb) {
    if (isDesktop) return 600; // 桌面端最大宽度
    if (isTablet) return 500;
  }
  return '100%';
};

export default {
  isWeb,
  isSmallDevice,
  isTablet,
  isDesktop,
  wp,
  hp,
  fontSize,
  platformValue,
  getMaxContainerWidth,
};
