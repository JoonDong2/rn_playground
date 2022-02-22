import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { calculateBoundary, circulateScrollTop } from './ranges';

interface CircularScrollViewProps<ItemT> {
    data: ItemT[];
    renderItem: (props: { item: ItemT; index: number }) => React.ReactElement;
    itemHeight: number;
    style?: StyleProp<ViewStyle>;
}

function CircularScrollView<ItemT>({
    data,
    renderItem,
    itemHeight = 80,
    style,
}: CircularScrollViewProps<ItemT>) {
    const scrollTop = useSharedValue(0);
    const contentsHeight = useSharedValue(0);
    const itemLength = useSharedValue(0);
    const height = useSharedValue(0);
    const boundary = useSharedValue<number[]>([]);
    const firstIndexScrollTop = useSharedValue(0);

    const [items, setItemsInfo] = useState<{
        itemsInfo: number[];
        firstItemScrollTop: number;
    }>({
        itemsInfo: [],
        firstItemScrollTop: 0,
    });

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
        });
        // console.log("boundary", newBoudary);
        setItemsInfo({ itemsInfo: boundary, firstItemScrollTop: 0 });
    }, [
        layoutHeight,
        contentsHeight,
        data,
        height,
        itemHeight,
        itemLength,
        boundary,
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
    >({
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
    });

    const setFirstIndexScrollTop = useCallback(
        async (scrollTop: number, items?: number[]) => {
            if (items) {
                setItemsInfo({
                    itemsInfo: items,
                    firstItemScrollTop: scrollTop,
                });
                setItemsInfo({
                    itemsInfo: items,
                    firstItemScrollTop: 0,
                });
            }
            firstIndexScrollTop.value = scrollTop;
        },
        [firstIndexScrollTop],
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
            });

            return { scrollTop: circulatedScrollTop, boundary };
        },
        (result, previous) => {
            if (!previous) return;

            const { boundary: oldBoundary } = previous;
            const { scrollTop, boundary: newBoundary } = result;
            const firstIndexScrollTop =
                scrollTop <= 0
                    ? scrollTop - Math.ceil(scrollTop / itemHeight) * itemHeight
                    : scrollTop -
                      Math.ceil(scrollTop / itemHeight) * itemHeight;

            if (
                newBoundary.every((item, index) => oldBoundary[index] === item)
            ) {
                runOnJS(setFirstIndexScrollTop)(firstIndexScrollTop);
                return;
            }

            runOnJS(setFirstIndexScrollTop)(firstIndexScrollTop, [
                ...result.boundary,
            ]);
        },
        [scrollTop],
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
                {items.itemsInfo.map((item, index) => {
                    return (
                        <ItemContainer
                            key={item}
                            itemHeight={itemHeight}
                            firstIndexScrollTop={
                                items.firstItemScrollTop
                                    ? { value: items.firstItemScrollTop }
                                    : firstIndexScrollTop
                            }
                            index={index}>
                            {renderItem({
                                item: data[item],
                                index: item,
                            })}
                        </ItemContainer>
                    );
                })}
            </Animated.View>
        </PanGestureHandler>
    );
}

export default CircularScrollView;
