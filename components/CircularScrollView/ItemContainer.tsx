import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

interface ItemContainerProps {
    children: any;
    style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
}

export default ({ children, style }: ItemContainerProps) => {
    return <Animated.View style={style}>{children}</Animated.View>;
};
