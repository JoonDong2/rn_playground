import { Dimensions, Platform } from 'react-native';

export const window = Dimensions.get('window');
export const screen = Dimensions.get('screen');

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

const END_POINT = 'https://4c54-2001-4430-5063-c238-104d-475-30b5-abdf.ngrok.io';
export const CHAT_LIST_END_POINT = END_POINT + '/webrtc/rooms';
export const WS_END_POINT = END_POINT + '/webrtc/socket';
