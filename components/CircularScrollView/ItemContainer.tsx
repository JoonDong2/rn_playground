import React from 'react';
import Animated, {
    SharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';
const isEqual = require('react-fast-compare');

interface ItemContainerProps {
    children: any;
    itemHeight: number;
    index: number;
    firstIndexScrollTop: SharedValue<number>;
}

const ItemContainer = ({
    children,
    itemHeight,
    index,
    firstIndexScrollTop,
}: ItemContainerProps) => {
    const containerStyle = useAnimatedStyle(() => ({
        top: firstIndexScrollTop.value + index * itemHeight,
    }));

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

export default React.memo(ItemContainer, isEqual);
