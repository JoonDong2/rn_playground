import { Dimensions, Platform } from 'react-native';

export const window = Dimensions.get('window');
export const screen = Dimensions.get('screen');

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
