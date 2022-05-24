import { NextFunction, Request, Response } from 'express';
import { IMessage, Message, Room, RoomUser, User } from '../models';
import ApiError from '../errors/ApiError';
import { createResponse } from '../dto';
import { wss } from './ws';
import MessageController from './message';
import WebSocket, { Server } from 'ws';
import { convertUser } from './user';

export const checkIsOwner = async (roomId: number, userId: number, next: NextFunction) => {
    const room = await Room.findOne({ where: { id: roomId } }) as any;

    if (!room) {
        return next(ApiError.badRequest('Room with this id not found'))
    }

    if (room.ownerId !== userId) {
        return next(ApiError.badRequest('You don have access to invite users'))
    }

    return room;
}

class RoomController {
    private wss: Server<WebSocket>;

    constructor(wss: Server<WebSocket>) {
        this.wss = wss;
    }

    async create(req: any, res: Response, next: NextFunction) {
        const { avatar, title, userIds } = req.body;
        const user = req.user;

        if (!title) {
            next(ApiError.badRequest('Не задан title у диалога'))
        }
        const room = await Room.create({ avatar, title, ownerId: user.id }) as any;

        await RoomUser.create({ userId: user.id, roomId: room.id });

        for (let userId of userIds) {
            await RoomUser.create({ userId, roomId: room.id });
        }

        return res.json(createResponse({ data: room }));
    }

    async inviteUser(req: any, res: Response, next: NextFunction) {
        const { userId, roomId } = req.body;
        const user = req.user;

        await checkIsOwner(roomId, user.id, next);

        const candidateUser = await User.findOne({ where: { id: userId } }) as any;

        if (!candidateUser) {
            return next(ApiError.badRequest('User not found'));
        }

        const message = await MessageController.create({
            roomId,
            userId,
            message: `User ${candidateUser?.username} was invited to room`,
            event: 'invite-user',
        });

        this.wss.clients.forEach(client => {
            client.send(JSON.stringify(message));
        });

        await RoomUser.create({ roomId, userId });

        return res.json(createResponse({ data: { newUser: candidateUser }}))
    }

    async removeUser(req: any, res: Response, next: NextFunction) {
        const { userId, roomId } = req.body;
        const user = req.user;

        await checkIsOwner(roomId, user.id, next);

        const candidate = await User.findOne({ where: { id: userId } }) as any;
        await RoomUser.destroy({ where: { roomId, userId }});

        const message = await MessageController.create({
            roomId,
            userId,
            message: `User ${candidate?.username} was removed from room`,
            event: 'remove-user',
        });

        this.wss.clients.forEach(client => {
            client.send(JSON.stringify(message));
        });

        return res.json(createResponse({ data: true }));
    }

    async removeRoom(req: any, res: Response, next: NextFunction) {
        const { roomId } = req.params;
        const user = req.user;

        await checkIsOwner(roomId, user.id, next);

        const roomUsers = await RoomUser.findAll({ where: { roomId } });

        for (let roomUser of roomUsers) {
            await roomUser.destroy();
        }

        await Room.destroy({ where: { id: roomId }});

        return res.json(createResponse({ data: true }));
    }

    async changeAvatar(req: any, res: Response, next: NextFunction) {
        const { avatar, roomId } = req.body;
        const user = req.user;

        const room = await checkIsOwner(roomId, user.id, next);

        await room.set({
            avatar,
        });

        return res.json(createResponse({ data: await room.save() }))
    }

    async changeTitle(req: any, res: Response, next: NextFunction) {
        const { title, roomId } = req.body;
        const user = req.user;

        const room = await checkIsOwner(roomId, user.id, next);

        await room.set({
            title,
        });

        return res.json(createResponse({ data: await room.save() }))
    }

    async checkIsOwner(roomId: number, userId: number, next: NextFunction) {
        const room = await Room.findOne({ where: { id: roomId } }) as any;

        if (!room) {
            return next(ApiError.badRequest('Room with this id not found'))
        }

        if (room.ownerId !== userId) {
            return next(ApiError.badRequest('You don have access to invite users'))
        }

        return room;
    }

    async getRooms(req: any, res: Response, next: NextFunction) {
        const user = req.user;

        const userRooms = await RoomUser.findAll({ where: { userId: user.id } }) as any[];

        const userRoomsIds = userRooms.map(it => it.roomId);

        const result: any[] = [];

        for (let roomId of userRoomsIds) {
            const room = await Room.findOne({ where: { id: roomId } });
            if (room) {
                result.push(room);
            }
        }

        return res.json(createResponse({
            data: result,
        }))
    }

    async getRoom(req: any, res: Response, next: NextFunction) {
        const { roomId } = req.params;

        const room = await Room.findOne({ where: { id: roomId } });

        return res.json(createResponse({ data: room }));
    }

    async getRoomUsers(req: any, res: Response, next: NextFunction) {
        const { roomId } = req.params;
        const currentUser = req.user;

        const usersIds = (await RoomUser.findAll({ where: { roomId } }) as any[]).map(it => it.userId);

        const result: any[] = [];

        for (let userId of usersIds) {
            const user = await User.findOne({ where: { id: userId } }) as any;
            if (user) {
                result.push(await convertUser(currentUser.id, user));
            }
        }

        return res.json(createResponse({
            data: result,
        }))
    }

    async deleteMessage(req: any, res: Response, next: NextFunction){
        const { messageId } = req.params;
        const user = req.user;

        const candidate = await Message.findOne({ where: { id: messageId } }) as any;

        if (!candidate) {
            return next(ApiError.badRequest('Message not found'));
        }

        const isUserMessage = candidate.userId === user.id;
        if (isUserMessage) {
            await candidate.destroy();
            return res.json(createResponse({ data: true }));
        }

        const room = await Room.findOne({ where: { id: candidate.roomId } }) as any;
        const isOwner = room.ownerId === user.id;

        if (isOwner) {
            await candidate.destroy();
            return res.json(createResponse({ data: true }));
        }
    }

    async updateRoom(req: any, res: Response, next: NextFunction) {
        const { title, roomId, avatar, userIds } = req.body;
        const user = req.user;

        const room = await checkIsOwner(roomId, user.id, next);
        const roomUsers = await RoomUser.findAll({ where: { roomId } }) as any[];
        const roomUsersIds = roomUsers.map(it => it.userId);
        const usersToRemove = roomUsersIds.filter(it => !userIds.includes(it));

        for (let userId of usersToRemove) {
            await RoomUser.destroy({ where: { roomId, userId } });
        }

        for (let userId of userIds) {
            const candidate = roomUsers.find(it => it.userId === userId);
            if (!candidate) {
                await RoomUser.create({ userId, roomId: room.id });
            }
        }

        await room.set({
            title,
            avatar,
        });

        return res.json(createResponse({ data: await room.save() }))
    }
}

export default new RoomController(wss);
