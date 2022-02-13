import { Dimensions, Platform } from 'react-native';

export const window = Dimensions.get('window');
export const screen = Dimensions.get('screen');

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

const END_POINT = 'c652-2001-4430-506c-272a-accb-7fa3-f7b8-65d0.ngrok.io';
export const CHAT_LIST_END_POINT = 'https://' + END_POINT + '/webrtc/rooms';
export const WS_END_POINT = 'ws://' + END_POINT + '/webrtc/socket';
