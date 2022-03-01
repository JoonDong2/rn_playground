import React from 'react';
import Animated, {
    SharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';
import isEqual from 'react-fast-compare';

interface ItemContainerProps {
    children: any;
    firstIndexScrollTop: SharedValue<number>;
}

const ItemContainer = ({
    children,
    firstIndexScrollTop,
}: ItemContainerProps) => {
    const containerStyle = useAnimatedStyle(
        () => ({
            transform: [
                {
                    translateY: firstIndexScrollTop.value,
                },
            ],
        }),
        [],
    );

    return <Animated.View style={containerStyle}>{children}</Animated.View>;
};

export default React.memo(ItemContainer, isEqual);
