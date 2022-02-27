import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
    cancelAnimation,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedReaction,
    useSharedValue,
    withDecay,
} from 'react-native-reanimated';
import ItemContainer from './ItemContainer';
import { getBoundaryWithOrder, initializeBoundary } from './optimizer';
import { calculateBoundary, circulateScrollTop } from './ranges';

interface CircularScrollViewProps<ItemT> {
    data: ItemT[];
    renderItem: (props: {
        item: ItemT;
        index: number;
        order: number;
    }) => React.ReactElement;
    itemHeight: number;
    style?: StyleProp<ViewStyle>;
    buffer?: number;
}

function CircularScrollView<ItemT>({
    data,
    renderItem,
    itemHeight = 80,
    style,
    buffer = 2,
}: CircularScrollViewProps<ItemT>) {
    const scrollTop = useSharedValue(0);
    const contentsHeight = useSharedValue(0);
    const itemLength = useSharedValue(0);
    const height = useSharedValue(0);
    const firstIndexScrollTop = useSharedValue(0);

    const [items, setItems] = useState<{ value: number; order: number }[]>([]);

    const [layoutHeight, setLayoutHeight] = useState(0);

    useEffect(() => {
        if (!layoutHeight) return;
        const newContentsHeight = data.length * itemHeight;
        contentsHeight.value = newContentsHeight;
        const newItemValue = data.length;
        itemLength.value = newItemValue;

        const boundary = calculateBoundary({
            scrollTop: 0,
            height: layoutHeight,
            contentsHeight: newContentsHeight,
            itemHeight,
            itemLength: newItemValue,
            buffer,
        });
        // console.log('boundary', boundary);
        setItems(initializeBoundary(boundary));
    }, [
        layoutHeight,
        contentsHeight,
        data,
        height,
        itemHeight,
        itemLength,
        buffer,
    ]);

    const onLayout = useCallback(
        (event: LayoutChangeEvent) => {
            height.value = event.nativeEvent.layout.height;
            setLayoutHeight(event.nativeEvent.layout.height);
        },
        [height],
    );

    const onModalGestureEvent = useAnimatedGestureHandler<
        PanGestureHandlerGestureEvent,
        {
            firstScrollTop: number;
        }
    >(
        {
            onStart: (_, ctx) => {
                cancelAnimation(scrollTop);
                ctx.firstScrollTop = scrollTop.value;
            },
            onActive: (event, ctx) => {
                scrollTop.value = ctx.firstScrollTop + event.translationY;
            },
            onEnd: event => {
                scrollTop.value = withDecay(
                    {
                        velocity: event.velocityY,
                    },
                    isFinished => {
                        if (!isFinished) return;
                        scrollTop.value = circulateScrollTop({
                            scrollTop: scrollTop.value,
                            contentsHeight: contentsHeight.value,
                        });
                    },
                );
            },
        },
        [items],
    );

    const setFirstIndexScrollTop = useCallback(
        async (scrollTop: number, boundary?: number[]) => {
            if (boundary) {
                setItems(prev =>
                    getBoundaryWithOrder(boundary, prev, data.length - 1),
                );
            }
            firstIndexScrollTop.value = scrollTop;
        },
        [data.length, firstIndexScrollTop],
    );

    useAnimatedReaction(
        () => {
            const circulatedScrollTop = circulateScrollTop({
                scrollTop: scrollTop.value,
                contentsHeight: contentsHeight.value,
            });

            const boundary = calculateBoundary({
                scrollTop: circulatedScrollTop,
                height: height.value,
                contentsHeight: contentsHeight.value,
                itemHeight,
                itemLength: data.length,
                buffer,
            });

            return { scrollTop: circulatedScrollTop, boundary };
        },
        (result, previous) => {
            if (!previous) return;

            const { boundary: oldBoundary } = previous;
            const { scrollTop, boundary: newBoundary } = result;
            const firstIndexScrollTop =
                scrollTop -
                (Math.ceil(scrollTop / itemHeight) + buffer) * itemHeight;

            if (
                newBoundary.every((item, index) => oldBoundary[index] === item)
            ) {
                runOnJS(setFirstIndexScrollTop)(firstIndexScrollTop);
                return;
            }

            // console.log('boundary:', newBoundary);

            runOnJS(setFirstIndexScrollTop)(
                firstIndexScrollTop,
                result.boundary,
            );
        },
        [scrollTop, items],
    );

    // console.log('\n\n\n', items, '\n\n\n');

    return (
        <PanGestureHandler onGestureEvent={onModalGestureEvent}>
            <Animated.View
                style={[
                    style,
                    { overflow: 'hidden', backgroundColor: '#000000' },
                ]}
                onLayout={onLayout}>
                {items.map((item, index) => {
                    return (
                        <ItemContainer
                            key={`${item.value}-${item.order}`}
                            itemHeight={itemHeight}
                            firstIndexScrollTop={firstIndexScrollTop}
                            workletRefresh={items}
                            index={index}>
                            {renderItem({
                                item: data[item.value],
                                index: item.value,
                                order: item.order,
                            })}
                        </ItemContainer>
                    );
                })}
            </Animated.View>
        </PanGestureHandler>
    );
}

export default CircularScrollView;
