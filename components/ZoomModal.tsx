import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import { MODAL_STATUS } from '../navigations/TabNavigation';

interface ZoomModalProps {
    modalProgress: SharedValue<number>;
    style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
}

export default ({ modalProgress, style }: ZoomModalProps) => {
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
