import ws from 'ws';
import { IMessage, IMessageWithoutId } from '../models';
import MessageController from './message';
import WebSocket from 'ws';

const WS_PORT = process.env.WS_PORT || 5500;
export const wss = new ws.Server({
    port: Number(WS_PORT),
}, () => console.log(`Websocket was started on port: ${WS_PORT}`));

const broadCastMessage = (id: number, message: IMessage) => {
    wss.clients.forEach((client: any) => {
        if (client.id === id) {
            client.send(JSON.stringify(message));
        }
    })
}

const onConnection = async (ws: any) => {
    ws.on('message', async (message: string) => {
        const dataMessage = JSON.parse(message) as IMessageWithoutId;
        let msgFromDB;
        if (dataMessage.event !== 'connection') {
            msgFromDB = await MessageController.create(dataMessage) as any;
        }

        switch (dataMessage.event) {
            case 'message':
                broadCastMessage(ws.id, msgFromDB);
                break;
            case 'connection':
                ws.id = dataMessage.roomId;
                // broadCastMessage(this.wss, ws.id, msgFromDB);
                break;
            case 'invite-user':
                broadCastMessage(ws.id, msgFromDB);
                break;
            case 'remove-user':
                broadCastMessage(ws.id, msgFromDB);
                break;
        }
    });
}

wss.on('connection', onConnection);
