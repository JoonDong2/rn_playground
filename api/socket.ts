import SocketIOClient from 'socket.io-client';
import { WS_END_POINT } from '../Constants';

export const getSocket = (query: {
    type: 'owner' | 'visitor';
    nickname: string;
    roomName: string;
    password?: string;
}) => {
    return SocketIOClient(WS_END_POINT, {
        reconnectionDelayMax: 10000,
        transports: ['websocket'],
        query,
    });
};
