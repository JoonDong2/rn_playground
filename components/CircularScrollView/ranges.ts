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
    const circulatedScrollTop = circulateScrollTop({
        scrollTop,
        contentsHeight,
    });

    const pureIndex = Math.floor(-circulatedScrollTop / itemHeight);
    if (pureIndex < 0) return pureIndex + itemLength;
    return pureIndex;
};

export const calculateBoundary = ({
    scrollTop,
    height,
    contentsHeight,
    itemHeight,
    itemLength,
    buffer = 0,
}: {
    scrollTop: number;
    height: number;
    contentsHeight: number;
    itemHeight: number;
    itemLength: number;
    buffer: number;
}) => {
    'worklet';
    let firstIndex = calculateFirstIndex({
        scrollTop,
        height,
        contentsHeight: contentsHeight,
        itemHeight,
        itemLength: itemLength,
    });

    const maxIndex = itemLength - 1;

    if (buffer) {
        firstIndex = ((firstIndex - buffer + 1) % maxIndex) + maxIndex;
    }

    const doubleBuffer = buffer * 2;
    const pureOffsetCount = Math.ceil(height / itemHeight);
    const offsetCount =
        Math.ceil(
            (height - (pureOffsetCount - 1) * itemHeight) / itemHeight +
                pureOffsetCount,
        ) + doubleBuffer;

    const boundary = [];
    for (let i = 0; i < offsetCount; i++) {
        boundary.push((firstIndex + i) % (maxIndex + 1));
    }

    return boundary;
};
