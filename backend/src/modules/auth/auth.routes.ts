import { Router } from 'express';
import { loginUser, getMe } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/login', loginUser);
router.get('/me', authenticate, getMe);

export default router;
