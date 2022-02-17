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
import { screen } from '../../Constants';
import ItemContainer from './ItemContainer';
import { circulateScrollTop } from './ranges';

interface SpareProps {
    isSpare: boolean;
    spareHeight: number;
}

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
    const range = useSharedValue<{ index: number; key: string }[]>([]);

    const [height, setHeight] = useState(0);

    // eslint-disable-next-line prettier/prettier
    const [items, setItems] = useState<((ItemT | SpareProps) & {index: number})[]>([]);

    useEffect(() => {
        if (!height) return;
        const pureContentsHeight = data.length * itemHeight;
        contentsHeight.value = Math.max(pureContentsHeight, height);

        const spareHeight = height - pureContentsHeight;
        if (spareHeight < 0) {
            setItems(data.map((item, index) => ({ ...item, index })));
        } else {
            setItems([
                ...data.map((item, index) => ({ ...item, index })),
                { isSpare: true, spareHeight, index: data.length },
            ]);
        }
        
    }, [contentsHeight, data, height, itemHeight]);

    const onLayout = useCallback((event: LayoutChangeEvent) => {
        console.log("여기a", event.nativeEvent.layout.height);
        setHeight(event.nativeEvent.layout.height);
    }, []);

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
            scrollTop.value = withDecay({
                velocity: event.velocityY,
            }, (isFinished) => {
                if (!isFinished) return;
                const aa = circulateScrollTop({
                    scrollTop: scrollTop.value,
                    height,
                    contentsHeight: contentsHeight.value,
                });
                console.log("여기2", aa)
                scrollTop.value = aa;
            });
        },
    });

    useAnimatedReaction(
        () => {
            return scrollTop.value;
        },
        (result, previous) => {
            console.log("여기", result);
        },
        [scrollTop, contentsHeight],
    );

    const testStyle = useAnimatedStyle(() => ({
        transform: [{
            translateY: scrollTop.value
        }],
    }))

    return (
        <PanGestureHandler onGestureEvent={onModalGestureEvent}>
            <Animated.View
                style={[style, { overflow: 'hidden' }]}
                onLayout={onLayout}>
                {items.map(item => {
                    const spare = item as SpareProps;
                    if (spare.isSpare && spare.spareHeight) {
                        return (
                            <Animated.View
                                key={item.index}
                                style={[{
                                    height: spare.spareHeight,
                                    backgroundColor: 'yellow',
                                }, testStyle]}
                            />
                        );
                    }
                    const realItem = item as ItemT & { index: number };
                    return (
                        <ItemContainer style={testStyle} key={item.index}>
                            {renderItem({
                                item: realItem,
                                index: realItem.index,
                            })}
                        </ItemContainer>
                    );
                })}
            </Animated.View>
        </PanGestureHandler>
    );
}

export default CircularScrollView;
