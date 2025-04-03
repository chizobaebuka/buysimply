
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

export const authenticateToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
        return;
    }

    try {
        const decoded = await Promise.resolve(jwt.verify(token, JWT_SECRET));
        req.user = decoded as any;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token.' });
        return;
    }
};

export const isSuperAdmin = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    if (req.user?.role !== 'superAdmin') {
        res.status(403).json({ message: 'Access denied. Super Admin only.' });
        return;
    }
    next();
};

