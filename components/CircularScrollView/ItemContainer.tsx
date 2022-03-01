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
    firstIndex: SharedValue<number>;
    firstIndexValue: number;
    maxIndex: number;
    firstIndexScrollTop: SharedValue<number>;
}

const ItemContainer = ({
    children,
    index,
    itemHeight,
    firstIndex, // firstIndexScrollTop이 적용되었어야 할 (하지만 적용되지 바뀌지 않았을 수도 있는) 실제 인덱스의 값
    firstIndexValue, // items[0]의 값
    maxIndex,
    firstIndexScrollTop,
}: ItemContainerProps) => {
    const containerStyle = useAnimatedStyle(() => {
        // console.log("여기", firstIndex.value, firstIndexValue)

        const isUpScroll1 =
            firstIndexValue === maxIndex && firstIndex.value === 0;
        const isUpScroll2 = !isUpScroll1 && firstIndexValue < firstIndex.value;

        const isDownScroll =
            firstIndexValue === 0 && firstIndex.value === maxIndex;

        const isUpScroll = (isUpScroll1 || isUpScroll2) && !isDownScroll;

        return {
            top:
                firstIndexScrollTop.value +
                itemHeight * index +
                (firstIndex.value === firstIndexValue
                    ? 0
                    : isUpScroll
                    ? itemHeight
                    : -itemHeight),
        };
    }, [index]);

    return (
        <Animated.View style={[{ position: 'absolute' }, containerStyle]}>
            {children}
        </Animated.View>
    );
};

export default React.memo(ItemContainer, isEqual);
