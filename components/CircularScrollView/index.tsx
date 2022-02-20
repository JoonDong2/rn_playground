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
    buffer?: number;
    style?: StyleProp<ViewStyle>;
}

// let contentsHeight: number = 0;

function CircularScrollView<ItemT>({
    data,
    renderItem,
    itemHeight = 80,
    buffer = 0,
    style,
}: CircularScrollViewProps<ItemT>) {
    const scrollTop = useSharedValue(0);
    const contentsHeight = useSharedValue(0);
    const itemLength = useSharedValue(0);
    const height = useSharedValue(0);
    const boundary = useSharedValue<number[]>([]);

    const [items, setItems] = useState<number[]>([]);

    const [layoutHeight, setLayoutHeight] = useState(0);

    useEffect(() => {
        if (!layoutHeight) return;
        const newContentsHeight = data.length * itemHeight;
        contentsHeight.value = newContentsHeight;
        const newItemValue = data.length;
        itemLength.value = newItemValue;

        const newBoudary = calculateBoundary({
            scrollTop: 0,
            height: layoutHeight,
            contentsHeight: newContentsHeight,
            itemHeight,
            itemLength: newItemValue,
            buffer,
        });
        boundary.value = newBoudary;
        // console.log("boundary", newBoudary);
        setItems(newBoudary);
    }, [
        layoutHeight,
        contentsHeight,
        data,
        height,
        itemHeight,
        itemLength,
        boundary,
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

    useAnimatedReaction(
        () => {
            return scrollTop.value;
        },
        (result, previous) => {
            if (previous === null || result === previous) return;
            // newScrollTop을 사용하여 화면에 표시될 아이템 인덱스 배열 만들기
            const newBoundary = calculateBoundary({
                scrollTop: result,
                height: height.value,
                contentsHeight: contentsHeight.value,
                itemHeight,
                itemLength: itemLength.value,
                buffer,
            });

            if (
                newBoundary.every(
                    (item, index) => boundary.value[index] === item,
                )
            ) {
                return;
            }

            // console.log("boundary", newBoundary);
            boundary.value = newBoundary;
            runOnJS(setItems)(newBoundary);
        },
        [scrollTop],
    );

    // console.log("\n\n\n", items, "\n\n\n");

    return (
        <PanGestureHandler onGestureEvent={onModalGestureEvent}>
            <Animated.View
                style={[
                    style,
                    { overflow: 'hidden', backgroundColor: '#000000' },
                ]}
                onLayout={onLayout}>
                {items.map((item, index, origin) => {
                    // console.log("여기", origin, buffer, origin[buffer]);
                    return (
                        // buffer 크기와 동일한 인덱스는 실제 화면에 보이는 첫 번째 인덱스가 된다.
                        <ItemContainer
                            // style={testStyle}
                            key={item}
                            scrollTop={scrollTop}
                            firstIndex={buffer}
                            firstIndexValue={origin[buffer]}
                            itemHeight={itemHeight}
                            itmeLength={data.length}
                            index={index}
                            contentsHeight={contentsHeight}>
                            {data[item]
                                ? renderItem({
                                      item: data[item],
                                      index: item,
                                  })
                                : null}
                        </ItemContainer>
                    );
                })}
            </Animated.View>
        </PanGestureHandler>
    );
}

export default CircularScrollView;
