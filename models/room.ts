import sequelize from '../db';
import { DataTypes } from 'sequelize';
import { User } from './user';
import { Message } from './message';

export const Room = sequelize.define('room', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, unique: true },
    ownerId: { type: DataTypes.INTEGER },
    avatar: { type: DataTypes.STRING },
});

export const RoomUser = sequelize.define('room_user', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
});

Room.belongsToMany(User, { through: RoomUser });
User.belongsToMany(Room, { through: RoomUser });

Room.hasMany(Message);
Message.belongsTo(Room);

