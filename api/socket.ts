import { io } from 'socket.io-client';
import { WS_END_POINT } from '../Constants';

export const getSocket = (query: {
    type: 'owner' | 'visitor';
    nickname: string;
    roomName: string;
    password?: string;
}) => {
    return io(WS_END_POINT, {
        reconnectionDelayMax: 10000,
        transports: ['websocket'],
        query,
    });
};
