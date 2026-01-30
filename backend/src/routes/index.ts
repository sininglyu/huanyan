import { Router } from 'express';
import { authRouter } from './auth';
import { userRouter } from './user';
import { analysisRouter } from './analysis';
import { communityRouter } from './community';
import { recommendRouter } from './recommend';
import { tryonRouter } from './tryon';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/analysis', analysisRouter);
router.use('/community', communityRouter);
router.use('/recommend', recommendRouter);
router.use('/tryon', tryonRouter);

export const apiRouter = router;
