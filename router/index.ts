import { Router } from 'express';
import userRouter from './user';
import friendsRouter from './friends';
import roomRouter from './room';

const router = Router();

router.use('/user', userRouter)
router.use('/friends', friendsRouter)
router.use('/rooms', roomRouter)

export default router;
