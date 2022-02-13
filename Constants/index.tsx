import { Dimensions, Platform } from 'react-native';

export const window = Dimensions.get('window');
export const screen = Dimensions.get('screen');

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

const END_POINT = 'https://7448-2001-4430-506c-272a-f527-6f16-90-4012.ngrok.io';
export const CHAT_LIST_END_POINT = END_POINT + '/webrtc/rooms';
export const WS_END_POINT = END_POINT + '/webrtc/socket';
