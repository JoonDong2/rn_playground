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
    itemHeight,
    itemLength,
    buffer,
}: {
    scrollTop: number;
    itemHeight: number;
    itemLength: number;
    buffer: number;
}) => {
    'worklet';
    const pureIndex = Math.floor(-scrollTop / itemHeight) - buffer;
    return pureIndex < 0 ? pureIndex + itemLength : pureIndex;
};

export const calculateBoundary = ({
    scrollTop,
    height,
    itemHeight,
    itemLength,
    buffer,
}: {
    scrollTop: number;
    height: number;
    contentsHeight: number;
    itemHeight: number;
    itemLength: number;
    buffer: number;
}) => {
    'worklet';
    const firstIndex = calculateFirstIndex({
        scrollTop,
        itemHeight,
        itemLength: itemLength,
        buffer,
    });

    const doubleBuffer = buffer * 2;
    const maxIndex = itemLength - 1;

    const pureOffsetCount = Math.ceil(height / itemHeight);
    const offsetCount = Math.ceil(
        (height - (pureOffsetCount - 1) * itemHeight) / itemHeight +
            pureOffsetCount +
            doubleBuffer,
    );

    const boundary = [];
    for (let i = 0; i < offsetCount; i++) {
        boundary.push((firstIndex + i) % (maxIndex + 1));
    }

    return boundary;
};
