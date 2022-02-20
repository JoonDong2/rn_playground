import React from 'react';
import Animated, {
    SharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { circulateScrollTop } from './ranges';
const isEqual = require('react-fast-compare');

interface ItemContainerProps {
    children: any;
    scrollTop: SharedValue<number>;
    itemHeight: number;
    itmeLength: number;
    index: number;
    contentsHeight: SharedValue<number>;
}

const ItemContainer = ({
    children,
    scrollTop,
    itemHeight,
    index,
    contentsHeight,
}: ItemContainerProps) => {
    const containerStyle = useAnimatedStyle(() => {
        const circulatedScrollTop = circulateScrollTop({
            scrollTop: scrollTop.value,
            contentsHeight: contentsHeight.value,
        });

        const firstScrollTop =
            circulatedScrollTop <= 0
                ? circulatedScrollTop -
                  Math.ceil(circulatedScrollTop / itemHeight) * itemHeight
                : circulatedScrollTop -
                  Math.ceil(circulatedScrollTop / itemHeight) * itemHeight;

        return {
            top: firstScrollTop + index * itemHeight,
        };

        // if (circulatedScrollTop <= 0) {
        //     const firstIndexScrollTop =
        //         circulatedScrollTop -
        //         Math.ceil(circulatedScrollTop / itemHeight) * itemHeight;
        //     return {
        //         top: firstIndexScrollTop + index * itemHeight,
        //     };
        // } else {
        //     const firstIndexScrollTop =
        //     circulatedScrollTop -
        //     Math.ceil(circulatedScrollTop / itemHeight) * itemHeight;
        //     return {
        //         top: firstIndexScrollTop + index * itemHeight,
        //     };
        // }
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

export default React.memo(ItemContainer, isEqual);
