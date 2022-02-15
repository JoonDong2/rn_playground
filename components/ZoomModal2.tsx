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
    modalAppearing: SharedValue<boolean>;
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
    modalAppearing,
    style,
}: ZoomModalProps) => {
    const videoContainerStyle = useAnimatedStyle(() => ({
        width: modalAppearing.value
            ? screen.width
            : MINIFIED_VIDEO_WIDTH +
              (screen.width * (modalMinifiedTop - modalTop.value)) /
                  (modalMinifiedTop * 0.3),
    }));

    const etcContainerStyle = useAnimatedStyle(() => ({
        opacity:
            (modalTop.value - modalMinifiedTop * 0.7) /
            (modalMinifiedTop * 0.3),
    }));

    return (
        <Animated.View
            style={[
                style,
                {
                    flex: 1,
                    flexDirection: 'row',
                    flexWrap: 'nowrap',
                    backgroundColor: '#ffffff',
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
            <Animated.View
                style={[
                    {
                        width: ETC_WIDTH,
                        height: MINIFIED_MODAL_HEIGHT,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                    },
                    etcContainerStyle,
                ]}>
                <Animated.Text
                    numberOfLines={1}
                    ellipsizeMode="tail">{`${nickName}님이 만든 방: ${roomName}`}</Animated.Text>
                <TouchableOpacity
                    style={{
                        width: MINIFIED_MODAL_HEIGHT - 20,
                        height: MINIFIED_MODAL_HEIGHT,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Animated.Text
                        style={{
                            fontSize: 20,
                            includeFontPadding: false,
                        }}>
                        X
                    </Animated.Text>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
};
