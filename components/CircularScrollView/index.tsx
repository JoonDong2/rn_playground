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
    buffer = 1,
}: CircularScrollViewProps<ItemT>) {
    const firstIndexScrollTop = useSharedValue(-buffer * itemHeight);
    const [items, setItems] = useState<{ value: number; order: number }[]>([]);

    const scrollTop = useSharedValue(-buffer * itemHeight);
    const scrollTopStart = useSharedValue(0);
    const deprecatedTranslationY = useSharedValue(0);

    const { value: threshold } = useSharedValue(buffer * itemHeight);

    const { value: itemLength } = useSharedValue(data.length);
    const { value: contentsHeight } = useSharedValue(data.length * itemHeight);
    const [layoutHeight, setLayoutHeight] = useState(0);

    // 초기화
    useEffect(() => {
        if (!layoutHeight) return;

        const boundary = calculateBoundary({
            scrollTop: 0,
            height: layoutHeight,
            contentsHeight,
            itemHeight,
            itemLength,
            buffer,
        });

        setItems(initializeBoundary(boundary));
    }, [layoutHeight, contentsHeight, data, itemHeight, itemLength, buffer]);

    const onLayout = useCallback((event: LayoutChangeEvent) => {
        setLayoutHeight(event.nativeEvent.layout.height);
    }, []);

    const restoreScrollTop = useCallback(async () => {
        scrollTop.value = circulateScrollTop({
            scrollTop: scrollTop.value,
            contentsHeight,
        });
        deprecatedTranslationY.value = 0;
    }, [contentsHeight, deprecatedTranslationY, scrollTop]);

    const onGestureEvent = useAnimatedGestureHandler<
        PanGestureHandlerGestureEvent,
        {
            scrollTopStart: number;
        }
    >(
        {
            onStart: (_, ctx) => {
                cancelAnimation(scrollTop);
                ctx.scrollTopStart = scrollTop.value;
                scrollTopStart.value = scrollTop.value;
            },
            onActive: (event, ctx) => {
                scrollTop.value = ctx.scrollTopStart + event.translationY;
            },
            onEnd: event => {
                scrollTop.value = withDecay(
                    {
                        velocity: event.velocityY,
                    },
                    isFinished => {
                        if (!isFinished) return;
                        runOnJS(restoreScrollTop)();
                    },
                );
            },
        },
        [items],
    );

    const setBoundary = useCallback(
        (boundary: number[]) => {
            setItems(prev =>
                getBoundaryWithOrder(boundary, prev, data.length - 1),
            );
        },
        [data.length],
    );

    const setFirstIndexScrollTop = useCallback(
        (scrollTop: number) => {
            firstIndexScrollTop.value = scrollTop;
        },
        [firstIndexScrollTop],
    );

    useAnimatedReaction(
        () => ({
            scrollTop: scrollTop.value,
            translationY: Math.abs(scrollTop.value - scrollTopStart.value),
        }),
        (result, previous) => {
            if (!previous) return;

            const { scrollTop, translationY } = result;

            const pureTranslationY =
                translationY - deprecatedTranslationY.value;

            console.log("여기", translationY, deprecatedTranslationY.value);
            if (pureTranslationY < threshold) {
                firstIndexScrollTop.value = scrollTop;
                return;
            }

            deprecatedTranslationY.value = translationY;

            return;

            // const newFirstIndexScrollTop =
            //     scrollTop -
            //     (Math.ceil(scrollTop / itemHeight) + buffer) * itemHeight;

            // if (
            //     newBoundary.every((item, index) => oldBoundary[index] === item)
            // ) {
            //     // firstIndexScrollTop.value = newFirstIndexScrollTop;
            //     runOnJS(setFirstIndexScrollTop)(
            //         newFirstIndexScrollTop,
            //         oldBoundary[0],
            //     );
            //     // firstIndex.value = oldBoundary[0];
            //     return;
            // }

            // // console.log('boundary:', newBoundary);

            // runOnJS(setBoundary)(newBoundary);
            // // firstIndexScrollTop.value = newFirstIndexScrollTop;
            // runOnJS(setFirstIndexScrollTop)(
            //     newFirstIndexScrollTop,
            //     newBoundary[0],
            // );
        },
        [scrollTop, items, threshold],
    );

    // console.log('\n\n\n', items, '\n\n\n');

    return (
        <PanGestureHandler onGestureEvent={onGestureEvent}>
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
                            index={index}
                            itemHeight={itemHeight}
                            firstIndexScrollTop={firstIndexScrollTop}>
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
