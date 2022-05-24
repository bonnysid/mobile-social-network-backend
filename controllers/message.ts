import { IMessage, IMessageWithoutId, Message, Room, RoomUser } from '../models';
import { NextFunction, Request, Response } from 'express';
import ApiError from '../errors/ApiError';
import { createResponse } from '../dto';

class MessageController {
    async create(message: IMessageWithoutId): Promise<IMessage> {
        const dbMessage = await Message.create({ ...message }) as any;
        return dbMessage;
    }

    async getMessages(req: any, res: Response, next: NextFunction) {
        const { roomId } = req.params;
        const user = req.user;
        const room = await Room.findOne({ where: { id: roomId } });

        if (!room) {
            return next(ApiError.badRequest('Room with this id not found'))
        }

        const roomUsers = await RoomUser.findOne({ where: { userId: user.id, roomId } });
        const userNotInRoom = !roomUsers;

        if (userNotInRoom) {
            return next(ApiError.badRequest('You dont have access to this room'));
        }

        const messages = await Message.findAll({ where: { roomId } });

        return res.json(createResponse({ data: messages }));
    }
}

export default new MessageController();
