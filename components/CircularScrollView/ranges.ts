export const circulateScrollTop = ({
    scrollTop,
    height,
    contentsHeight,
}: {
    scrollTop: number;
    height: number;
    contentsHeight: number;
}) => {
    'worklet';
    if (
        (scrollTop > 0 && scrollTop <= contentsHeight) ||
        (scrollTop < 0 && scrollTop >= -contentsHeight)
    )
        return scrollTop;
    if (scrollTop < 0) {
        return height + (scrollTop % contentsHeight);
    } else if (scrollTop > 0) {
        return -(
            contentsHeight -
            height -
            ((scrollTop - height) % contentsHeight)
        );
    }
    return scrollTop;
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
    const pureScrollTop = circulateScrollTop({
        scrollTop,
        height: height,
        contentsHeight,
    });

    const pureIndex = Math.floor(-pureScrollTop / itemHeight);

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
        firstIndex = ((firstIndex - buffer) % maxIndex) + maxIndex;
    }

    const doubleBuffer = 2 * buffer;
    const pureOffsetCount = Math.ceil(height / itemHeight);
    const offsetCount =
        Math.ceil(
            (height - (pureOffsetCount - 1) * itemHeight) / itemHeight +
                pureOffsetCount,
        ) + doubleBuffer;

    const boundary = [];
    for (let i = 0; i < offsetCount + doubleBuffer; i++) {
        boundary.push((firstIndex + i) % (maxIndex + 1));
    }

    return boundary;
};
