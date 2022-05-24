import { NextFunction, Request, Response } from 'express';
import { Friends, FriendsRequest, User } from '../models';
import ApiError from '../errors/ApiError';
import { createResponse } from '../dto';
import { convertUser, getUser } from './user';

class FriendsController {
    async sendFriendRequest(req: any, res: Response, next: NextFunction) {
        const { userId } = req.body;
        const user = req.user;

        const candidate = await User.findOne({ where: { id: userId } });
        if (!candidate) {
            return next(ApiError.badRequest('User not found'));
        }

        const userFriends = await Friends.findAll({ where: { userId1: user.id } }) as any[];
        const userAlreadyInFriend = await userFriends.find(it => it.id === userId);

        if (userAlreadyInFriend) {
            return next(ApiError.badRequest('User already is friend'));
        }

        await FriendsRequest.create({ userFrom: user.id, userTo: userId });

        return res.json(createResponse({ data: true }));
    }

    async isFriend(req: any, res: Response, next: NextFunction) {
        const { userId } = req.body;
        const user = req.user;

        const userFriends = await Friends.findAll({ where: { userId1: user.id } }) as any[];
        const userAlreadyInFriend = await userFriends.find(it => it.id === userId);

        return res.json(createResponse({ data: Boolean(userAlreadyInFriend) }));
    }

    async isFriendRequest(req: any, res: Response, next: NextFunction) {
        const { userId } = req.body;
        const user = req.user;

        const candidate = await FriendsRequest.findOne({ where: { userFrom: user.id, userTo: userId } });

        return res.json(createResponse({ data: Boolean(candidate) }));
    }

    async isFriendNative(userId: number, currentUserId: number) {
        const userFriends = await Friends.findAll({ where: { userId1: currentUserId } }) as any[];
        const userAlreadyInFriend = await userFriends.find(it => it.userId2 === userId);

        return Boolean(userAlreadyInFriend);
    }

    async isFriendRequestNative(userId: number, currentUserId: number) {
        const candidate = await FriendsRequest.findOne({ where: { userFrom: currentUserId, userTo: userId } });
        return Boolean(candidate);
    }

    async isWantToAddYouNative(userId: number, currentUserId: number) {
        const candidate = await FriendsRequest.findOne({ where: { userFrom: userId, userTo: currentUserId } });
        return Boolean(candidate);
    }

    async acceptFriendRequest(req: any, res: Response, next: NextFunction) {
        const { userFrom } = req.body;
        const user = req.user;

        const candidate = await FriendsRequest.findOne({ where: { userFrom: userFrom, userTo: user.id } });

        if (!candidate) {
            return next(ApiError.badRequest('You dont have friend request from this user'));
        }

        await candidate.destroy();
        await Friends.create({ userId1: user.id, userId2: userFrom });
        await Friends.create({ userId1: userFrom, userId2: user.id });

        return res.json(createResponse({ data: true }));
    }

    async declineFriendRequest(req: any, res: Response, next: NextFunction) {
        const { userFrom, userTo } = req.body;

        const candidate = await FriendsRequest.findOne({ where: { userFrom: userFrom, userTo } });

        if (!candidate) {
            return next(ApiError.badRequest('You dont have friend request from this user'));
        }

        await candidate.destroy();

        return res.json(createResponse({ data: true }));
    }

    async unFriend(req: any, res: Response, next: NextFunction) {
        const { userId } = req.body;
        const user = req.user;

        const candidate1 = await Friends.findOne({ where: { userId1: user.id, userId2: userId } });
        const candidate2 = await Friends.findOne({ where: { userId1: userId, userId2: user.id } });

        if (!candidate1 || !candidate2) {
            return next(ApiError.badRequest('You dont have this friend'));
        }

        await candidate1.destroy();
        await candidate2.destroy();

        return res.json(createResponse({ data: true }));
    }

    async getFriends(req: any, res: Response, next: NextFunction) {
        const user = req.user;
        const result: any[] = [];

        const friends = await Friends.findAll({ where: { userId1: user.id } }) as any[];
        const friendsIds = friends.map(it => it.userId2);

        for (let friendId of friendsIds) {
            const friend = await User.findOne({ where: { id: friendId } });
            if (friend) {
                result.push(getUser(friend as any));
            }
        }

        return res.json(createResponse({ data: result }))
    }
}

export default new FriendsController();
