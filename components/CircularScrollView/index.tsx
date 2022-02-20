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

    const [items, setItems] = useState<number[]>([]);

    const [layoutHeight, setLayoutHeight] = useState(0);

    useEffect(() => {
        if (!layoutHeight) return;
        const newContentsHeight = data.length * itemHeight;
        contentsHeight.value = newContentsHeight;
        const newItemValue = data.length;
        itemLength.value = newItemValue;

        const { boundary } = calculateBoundary({
            scrollTop: 0,
            height: layoutHeight,
            contentsHeight: newContentsHeight,
            itemHeight,
            itemLength: newItemValue,
        });
        // console.log("boundary", newBoudary);
        setItems(boundary);
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
        (newScrollTop: number, delay?: number) => {
            setTimeout(() => {
                firstIndexScrollTop.value = newScrollTop;
            }, delay || 0);
        },
        [firstIndexScrollTop],
    );

    useAnimatedReaction(
        () => {
            return {
                scrollTop: scrollTop.value,
                ...calculateBoundary({
                    scrollTop: scrollTop.value,
                    height: height.value,
                    contentsHeight: contentsHeight.value,
                    itemHeight,
                    itemLength: itemLength.value,
                }),
            };
        },
        (result, previous) => {
            if (
                previous === null ||
                result.scrollTop === previous.scrollTop ||
                result.boundary.every(
                    (item, index) => previous.boundary[index] === item,
                )
            ) {
                const newFirstIndexScrollTop =
                    result.circulatedScrollTop <= 0
                        ? result.circulatedScrollTop -
                          Math.ceil(result.circulatedScrollTop / itemHeight) *
                              itemHeight
                        : result.circulatedScrollTop -
                          Math.ceil(result.circulatedScrollTop / itemHeight) *
                              itemHeight;
                runOnJS(setFirstIndexScrollTop)(newFirstIndexScrollTop);
                return;
            }
            const circulatedScrollTop = circulateScrollTop({
                scrollTop: scrollTop.value,
                contentsHeight: contentsHeight.value,
            });

            const newFirstIndexScrollTop =
                circulatedScrollTop <= 0
                    ? circulatedScrollTop -
                      Math.ceil(circulatedScrollTop / itemHeight) * itemHeight
                    : circulatedScrollTop -
                      Math.ceil(circulatedScrollTop / itemHeight) * itemHeight;

            runOnJS(setItems)(result.boundary);
            runOnJS(setFirstIndexScrollTop)(newFirstIndexScrollTop, 50);
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
                {items.map((item, index) => {
                    return (
                        <ItemContainer
                            key={item}
                            scrollTop={scrollTop}
                            itemHeight={itemHeight}
                            firstIndexScrollTop={firstIndexScrollTop}
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
