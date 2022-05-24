import { Router } from 'express';
import C from '../controllers';
import {AuthMiddleware} from '../middlewares';

const router = Router();

router.post('/', AuthMiddleware, C.RoomController.create)
router.put('/', AuthMiddleware, C.RoomController.updateRoom)
router.get('/', AuthMiddleware, C.RoomController.getRooms)
router.get('/:roomId', AuthMiddleware, C.RoomController.getRoom)
router.delete('/:roomId', AuthMiddleware, C.RoomController.removeRoom)
router.post('/avatar', AuthMiddleware, C.RoomController.changeAvatar)
router.post('/title', AuthMiddleware, C.RoomController.changeTitle)
router.post('/invite', AuthMiddleware, C.RoomController.inviteUser)
router.post('/remove', AuthMiddleware, C.RoomController.removeUser)
router.get('/messages/:roomId', AuthMiddleware, C.MessageController.getMessages)
router.get('/users/:roomId', AuthMiddleware, C.RoomController.getRoomUsers)
router.delete('/message/:messageId', AuthMiddleware, C.RoomController.deleteMessage)

export default router;
