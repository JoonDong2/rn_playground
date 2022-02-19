import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
    cancelAnimation,
    useAnimatedGestureHandler,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withDecay,
} from 'react-native-reanimated';
import ItemContainer from './ItemContainer';
import {
    calculateBoundary,
    calculateFirstIndex,
    circulateScrollTop,
} from './ranges';

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
    buffer = 5,
    style,
}: CircularScrollViewProps<ItemT>) {
    const scrollTop = useSharedValue(0);
    const contentsHeight = useSharedValue(0);
    const itemLength = useSharedValue(0);
    const height = useSharedValue(0);
    const boundary = useSharedValue<number[]>([]);

    const [heightTrigger, setHeightTrigger] = useState(false);

    // eslint-disable-next-line prettier/prettier
    const [items, setItems] = useState<(ItemT & {index: number})[]>([]);

    useEffect(() => {
        if (!heightTrigger) return;
        console.log("여기", data);
        const newContentsHeight = data.length * itemHeight;
        contentsHeight.value = newContentsHeight;
        setItems(data.map((item, index) => ({ ...item, index })));
        const newItemValue = data.length;
        itemLength.value = newItemValue;

        const aa = calculateBoundary({
            scrollTop: 0,
            height: height.value,
            contentsHeight: newContentsHeight,
            itemHeight,
            itemLength: newItemValue,
            buffer,
        });
        boundary.value = aa;
        console.log(aa);
    }, [
        heightTrigger,
        contentsHeight,
        data,
        height,
        itemHeight,
        itemLength,
        boundary,
        scrollTop.value,
        buffer,
    ]);

    const onLayout = useCallback(
        (event: LayoutChangeEvent) => {
            height.value = event.nativeEvent.layout.height;
            setHeightTrigger(true);
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
                    const newScrollTop = circulateScrollTop({
                        scrollTop: scrollTop.value,
                        height: height.value,
                        contentsHeight: contentsHeight.value,
                    });
                    scrollTop.value = newScrollTop;
                },
            );
        },
    });

    useAnimatedReaction(
        () => {
            return scrollTop.value;
        },
        (result, previous) => {
            if (result === (previous || 0)) return;
            // TODO: newScrollTop을 사용하여 화면에 표시될 아이템 인덱스 배열 만들기
            // console.log('여기1', circulateScrollTop({
            //     scrollTop: result,
            //     height,
            //     contentsHeight: contentsHeight.value,
            // }));
            // const firstIndex = calculateFirstIndex({
            //     scrollTop: scrollTop.value,
            //     height: height.value,
            //     contentsHeight: contentsHeight.value,
            //     itemHeight,
            //     itemLength: itemLength.value,
            // });
            // console.log('여기1', firstIndex);
            boundary.value = calculateBoundary({
                scrollTop: scrollTop.value,
                height: height.value,
                contentsHeight: contentsHeight.value,
                itemHeight,
                itemLength: itemLength.value,
                buffer,
            });
        },
        [scrollTop, contentsHeight],
    );

    const testStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: scrollTop.value,
            },
        ],
    }));

    return (
        <PanGestureHandler onGestureEvent={onModalGestureEvent}>
            <Animated.View
                style={[style, { overflow: 'hidden' }]}
                onLayout={onLayout}>
                {items.map(item => {
                    return (
                        <ItemContainer style={testStyle} key={item.index}>
                            {renderItem({
                                item: item,
                                index: item.index,
                            })}
                        </ItemContainer>
                    );
                })}
            </Animated.View>
        </PanGestureHandler>
    );
}

export default CircularScrollView;
