
import { Router } from 'express';
import {
    getAllLoans,
    getLoansByEmail,
    getExpiredLoans,
    deleteLoan,
    createLoan
} from '../controllers/loanController';
import { authenticateToken, isSuperAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Protect all loan routes
router.use(authenticateToken);

router.get('/', getAllLoans);
router.get('/expired', getExpiredLoans);
router.get('/:userEmail/get', getLoansByEmail);
router.delete('/:loanId/delete', isSuperAdmin, deleteLoan);
router.post('/', isSuperAdmin, createLoan);

export default router;

