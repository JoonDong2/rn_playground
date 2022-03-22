import React from 'react';
import Animated, {
    SharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';
import isEqual from 'react-fast-compare';

interface ItemContainerProps {
    children: any;
    index: number;
    itemHeight: number;
    firstIndexScrollTop: SharedValue<number>;
}

const ItemContainer = ({
    children,
    index,
    itemHeight,
    firstIndexScrollTop,
}: ItemContainerProps) => {
    const containerStyle = useAnimatedStyle(() => {
        return {
            top: firstIndexScrollTop.value + itemHeight * index,
        };
    }, [index]);

    return (
        <Animated.View style={[{ position: 'absolute' }, containerStyle]}>
            {children}
        </Animated.View>
    );
};

export default React.memo(ItemContainer, isEqual);
