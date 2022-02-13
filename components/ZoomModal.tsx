import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import { Socket } from 'socket.io-client';

interface ZoomModalProps {
    socket: Socket | undefined;
    roomName: string | undefined;
    type: 'owner' | 'visitor' | undefined;
    modalTop: SharedValue<number>;
    modalHeight: SharedValue<number>;
    modalMaxHeight: number;
    modalMinifiedTop: number;
    style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
}

export default ({
    socket,
    roomName,
    type,
    modalTop,
    modalHeight,
    modalMaxHeight,
    modalMinifiedTop,
    style,
}: ZoomModalProps) => {
    useEffect(() => {
        
    }, []);
    return (
        <Animated.View
            style={[
                style,
                {
                    flex: 1,
                    backgroundColor: 'green',
                    opacity: 0.5,
                    justifyContent: 'center',
                    alignItems: 'center',
                },
            ]}>
            <Animated.Text>ZoomModal</Animated.Text>
        </Animated.View>
    );
};
