import sequelize from '../db';
import { DataTypes } from 'sequelize';

export interface IMessage extends IMessageWithoutId {
    id: number;
}

export interface IMessageWithoutId {
    message: string;
    userId: number;
    roomId: number;
    event: 'connection' | 'message' | 'invite-user' | 'remove-user';
}

export const Message = sequelize.define('message', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    message: { type: DataTypes.STRING },
    event: { type: DataTypes.STRING }
});
