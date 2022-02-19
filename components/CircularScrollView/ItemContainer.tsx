import React from 'react';
import Animated, {
    SharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { circulateScrollTop } from './ranges';

interface ItemContainerProps {
    children: any;
    scrollTop: SharedValue<number>;
    firstIndex: number;
    firstIndexValue: number;
    itemHeight: number;
    index: number;
    contentsHeight: SharedValue<number>;
}

export default ({
    children,
    scrollTop,
    firstIndex,
    firstIndexValue,
    itemHeight,
    index,
    contentsHeight,
}: ItemContainerProps) => {
    const containerStyle = useAnimatedStyle(() => {
        const top =
            circulateScrollTop({
                scrollTop: scrollTop.value,
                contentsHeight: contentsHeight.value,
            }) +
            firstIndexValue * itemHeight +
            (index - firstIndex) * itemHeight;
        return {
            top: top || 0,
        };
    });

    return (
        <Animated.View
            style={[
                containerStyle,
                {
                    position: 'absolute',
                },
            ]}>
            {children}
        </Animated.View>
    );
};
