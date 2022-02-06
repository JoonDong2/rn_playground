import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import { MODAL_STATUS } from '../navigations/TabNavigation';

interface ZoomModalProps {
    modalStatus: SharedValue<MODAL_STATUS>;
    modalProgress: SharedValue<number>;
    style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
}

export default ({ modalStatus, modalProgress, style }: ZoomModalProps) => {
    return (
        <Animated.View
            style={[
                style,
                {
                    backgroundColor: 'green',
                    opacity: 0.5,
                },
            ]}
        />
    );
};
