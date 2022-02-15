import React from 'react';
import {
    StyleProp,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Animated, {
    SharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { screen } from '../Constants';

interface ZoomModalProps {
    roomName: string;
    nickName: string;
    closeChatModal: (local?: boolean) => void;
    modalTop: SharedValue<number>;
    modalMinifiedTop: number;
    style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
}

const MINIFIED_MODAL_HEIGHT = 60;
const MINIFIED_VIDEO_WIDTH = (MINIFIED_MODAL_HEIGHT * 16) / 9;
const ETC_WIDTH = screen.width - MINIFIED_VIDEO_WIDTH;

export default ({
    roomName,
    nickName,
    closeChatModal,
    modalTop,
    modalMinifiedTop,
    style,
}: ZoomModalProps) => {
    const videoContainerStyle = useAnimatedStyle(() => ({
        width:
            MINIFIED_VIDEO_WIDTH +
            (screen.width * (modalMinifiedTop - modalTop.value)) /
                (modalMinifiedTop * 0.3),
    }));
    return (
        <Animated.View
            style={[
                style,
                {
                    flex: 1,
                    flexDirection: 'row',
                    backgroundColor: 'green',
                    flexWrap: 'nowrap',
                },
            ]}>
            <Animated.View
                style={[
                    {
                        minWidth: MINIFIED_VIDEO_WIDTH,
                        maxWidth: screen.width,
                        backgroundColor: '#000000',
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                    videoContainerStyle,
                ]}
            />
            <View
                style={{
                    width: ETC_WIDTH,
                    height: MINIFIED_MODAL_HEIGHT,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    backgroundColor: 'orange',
                }}>
                <Text>{`${nickName}님이 만든 방: ${roomName}`}</Text>
                <TouchableOpacity
                    style={{
                        width: MINIFIED_MODAL_HEIGHT - 20,
                        height: MINIFIED_MODAL_HEIGHT,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Text
                        style={{
                            fontSize: 20,
                            includeFontPadding: false,
                        }}>
                        X
                    </Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};
