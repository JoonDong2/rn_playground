import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

interface CircularScrollViewProps<ItemT> {
    data: ItemT[];
    renderItem: (props: { item: ItemT; index: number }) => React.ReactElement;
    itemHeight: number;
    style?: StyleProp<ViewStyle>;
}

let contentsHeight: number = 0;

function CircularScrollView<ItemT>({
    data,
    renderItem,
    itemHeight,
    style,
}: CircularScrollViewProps<ItemT>) {
    const [height, setHeight] = useState(0);
    const [items, setItems] =
        useState<(ItemT | { isSpare: boolean; spareHeight: number })[]>(data);

    useEffect(() => {
        if (!height) return;
        contentsHeight = data.length * itemHeight;

        const spareHeight = height - contentsHeight;
        if (spareHeight < 0) return;
        setItems(prev => [...prev, { isSpare: true, spareHeight }]);
    }, [data, height, itemHeight]);

    const onLayout = useCallback((event: LayoutChangeEvent) => {
        setHeight(event.nativeEvent.layout.height);
    }, []);

    return (
        <Animated.View style={style} onLayout={onLayout}>
        </Animated.View>
    )
};

export default CircularScrollView;
