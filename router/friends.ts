import { Router } from 'express';
import C from '../controllers';
import {AuthMiddleware} from '../middlewares';

const router = Router();

router.get('/', AuthMiddleware, C.FriendsController.getFriends)
router.post('/', AuthMiddleware, C.FriendsController.sendFriendRequest)
router.post('/is_friend', AuthMiddleware, C.FriendsController.isFriend)
router.post('/is_friend_request', AuthMiddleware, C.FriendsController.isFriendRequest)
router.post('/accept', AuthMiddleware, C.FriendsController.acceptFriendRequest)
router.post('/decline', AuthMiddleware, C.FriendsController.declineFriendRequest)
router.post('/unfriend', AuthMiddleware, C.FriendsController.unFriend)

export default router;
