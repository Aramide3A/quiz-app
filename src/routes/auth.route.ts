import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import { getCurrentUserController, loginController, signUpController } from '../controllers/auth.controller';

const router = Router();

router.post('/register', signUpController);
router.post('/login', loginController);
router.get('/users/me', authMiddleware, getCurrentUserController); 

export default router;