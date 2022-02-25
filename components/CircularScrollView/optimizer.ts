export const initializeBoundary = (boundary: number[]) => {
    const maxIndexStore: {
        [key: number]: number;
    } = {};
    return boundary.map(value => {
        const maxIndex = maxIndexStore[value];
        const newMaxIndex = maxIndex === undefined ? 0 : maxIndex + 1;
        maxIndexStore[value] = newMaxIndex;
        return {
            value,
            order: newMaxIndex,
        };
    });
};

export const getBoundaryWithOrder = (
    boundary: number[],
    prev: { value: number; order: number }[],
    maxIndex: number,
) => {
    if (prev.length === 0 || prev.length !== boundary.length) {
        return initializeBoundary(boundary);
    }

    const isUpScroll1 = prev[0].value === maxIndex && boundary[0] === 0;
    const isUpScroll2 = !isUpScroll1 && prev[0].value < boundary[0];
    const isUpScroll = isUpScroll1 || isUpScroll2;

    const maxOrder = Math.floor(boundary.length / (maxIndex + 1));
    const allOrders = Array.from({ length: maxOrder + 1 }, (_, i) => i);
    const curOrders: number[] = [];

    const boundaryWithOrder: { value: number; order: number }[] = [];

    // 위로 올리는 스크롤에 의해 boundary가 변경되었을 때
    // 마지막 아이템이 새로 추가된 아이템이고, 나머지는 prev에서 가져온다.
    if (isUpScroll) {
        const lastValue = boundary[boundary.length - 1];
        for (let i = 0; i < boundary.length - 1; i++) {
            const prevItem = prev[i + 1];
            if (prevItem.value === lastValue) {
                curOrders.push(prevItem.order);
            }
            boundaryWithOrder.push({
                value: boundary[i],
                order: prevItem.order,
            });
        }

        const lastItemOrder = Math.min(
            ...allOrders.filter(order => !curOrders.includes(order)),
        );
        boundaryWithOrder.push({
            value: boundary[boundary.length - 1],
            order: lastItemOrder,
        });
    }
    // 아래로 내리는 스크롤에 의해 boundary가 변경되었을 때
    // 첫 번째 아이템이 새로 추가된 아이템이고, 나머지는 prev에서 가져온다.
    else {
        const firstValue = boundary[0];

        // 더미 아이템 삽입
        boundaryWithOrder.push({
            value: boundary[0],
            order: -1, // 더미
        });
        for (let i = 1; i < boundary.length; i++) {
            const prevItem = prev[i - 1];
            if (prevItem.value === firstValue) {
                curOrders.push(prevItem.order);
            }
            boundaryWithOrder.push({
                value: boundary[i],
                order: prevItem.order,
            });
        }

        const firstItemOrder = Math.min(
            ...allOrders.filter(order => !curOrders.includes(order)),
        );
        boundaryWithOrder[0].order = firstItemOrder;
    }

    return boundaryWithOrder;
};
