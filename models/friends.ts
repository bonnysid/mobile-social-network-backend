import sequelize from '../db';
import { DataTypes } from 'sequelize';

export const Friends = sequelize.define('friends', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId1: { type: DataTypes.INTEGER },
    userId2: { type: DataTypes.INTEGER },
});

export const FriendsRequest = sequelize.define('friends_request', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userFrom: { type: DataTypes.INTEGER },
    userTo: { type: DataTypes.INTEGER },
});

