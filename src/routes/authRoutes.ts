
import { Router } from 'express';
import { 
    login, 
    logout, 
    signup, 
    getAllUsers, 
    getUserById, 
    deleteUser 
} from '../controllers/authController';
import { authenticateToken, isSuperAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/users', authenticateToken, isSuperAdmin, getAllUsers);
router.get('/users/:userId', authenticateToken, isSuperAdmin, getUserById);
router.delete('/users/:userId', authenticateToken, isSuperAdmin, deleteUser);

export default router;

