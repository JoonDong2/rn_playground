import React from 'react';
import Animated, {
    SharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { circulateScrollTop } from './ranges';
const isEqual = require("react-fast-compare");

interface ItemContainerProps {
    children: any;
    scrollTop: SharedValue<number>;
    firstIndex: number;
    firstIndexValue: number;
    itemHeight: number;
    itmeLength: number;
    index: number;
    contentsHeight: SharedValue<number>;
}

const ItemContainer = ({
    children,
    scrollTop,
    firstIndex,
    firstIndexValue,
    itemHeight,
    itmeLength,
    index,
    contentsHeight,
}: ItemContainerProps) => {
    const containerStyle = useAnimatedStyle(() => {
        const circulatedScrollTop = circulateScrollTop({
            scrollTop: scrollTop.value,
            contentsHeight: contentsHeight.value,
        });

        const top =
            circulatedScrollTop <= 0
                ? circulatedScrollTop +
                  firstIndexValue * itemHeight +
                  (index - firstIndex) * itemHeight
                : circulatedScrollTop +
                  (firstIndexValue - itmeLength) * itemHeight +
                  (index - firstIndex) * itemHeight;

        // console.log(`index: ${index} top: ${top} circulatedScrollTop: ${circulatedScrollTop} firstIndexValue * itemHeight: ${firstIndexValue * itemHeight} (index - firstIndex) * itemHeight: ${(index - firstIndex) * itemHeight}`);
        // console.log(`index: ${index} top: ${top} firstIndexValue: ${firstIndexValue}`);
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

export default React.memo(ItemContainer, isEqual);
