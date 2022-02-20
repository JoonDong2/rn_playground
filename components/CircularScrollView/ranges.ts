export const circulateScrollTop = ({
    scrollTop,
    contentsHeight,
}: {
    scrollTop: number;
    contentsHeight: number;
}) => {
    'worklet';
    return scrollTop % contentsHeight;
};

export const calculateFirstIndex = ({
    scrollTop,
    contentsHeight,
    itemHeight,
    itemLength,
}: {
    scrollTop: number;
    contentsHeight: number;
    itemHeight: number;
    itemLength: number;
}) => {
    'worklet';
    const circulatedScrollTop = circulateScrollTop({
        scrollTop,
        contentsHeight,
    });

    const pureIndex = Math.floor(-circulatedScrollTop / itemHeight);
    if (pureIndex < 0)
        return {
            firstIndex: pureIndex + itemLength,
            circulatedScrollTop,
        };
    return {
        firstIndex: pureIndex,
        circulatedScrollTop,
    };
};

export const calculateBoundary = ({
    scrollTop,
    height,
    contentsHeight,
    itemHeight,
    itemLength,
}: {
    scrollTop: number;
    height: number;
    contentsHeight: number;
    itemHeight: number;
    itemLength: number;
}) => {
    'worklet';
    const { firstIndex, circulatedScrollTop } = calculateFirstIndex({
        scrollTop,
        contentsHeight: contentsHeight,
        itemHeight,
        itemLength: itemLength,
    });

    const maxIndex = itemLength - 1;

    const pureOffsetCount = Math.ceil(height / itemHeight);
    const offsetCount = Math.ceil(
        (height - (pureOffsetCount - 1) * itemHeight) / itemHeight +
            pureOffsetCount,
    );

    const boundary = [];
    for (let i = 0; i < offsetCount; i++) {
        boundary.push((firstIndex + i) % (maxIndex + 1));
    }

    return { boundary, circulatedScrollTop };
};
