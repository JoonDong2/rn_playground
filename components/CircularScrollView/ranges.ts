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
}: {
    scrollTop: number;
    itemHeight: number;
    itemLength: number;
}) => {
    'worklet';
    const pureIndex = Math.floor(-scrollTop / itemHeight);
    return pureIndex < 0 ? pureIndex + itemLength : pureIndex;
};

export const calculateBoundary = ({
    scrollTop,
    height,
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
    const firstIndex = calculateFirstIndex({
        scrollTop,
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

    return boundary;
};
