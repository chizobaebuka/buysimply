
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { AuthRequest } from '../middlewares/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const STAFFS_FILE_PATH = join(__dirname, '../data/staffs.json');

const staffsData = JSON.parse(readFileSync(STAFFS_FILE_PATH, 'utf-8'));

interface PaginatedUserResponse {
    data: any[];
    pagination: {
        total: number;
        currentPage: number;
        totalPages: number;
        limit: number;
    };
}

const paginateUsers = (page: number = 1, limit: number = 10, data: any[]): PaginatedUserResponse => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
        pagination: {
            total: data.length,
            currentPage: page,
            totalPages: Math.ceil(data.length / limit),
            limit: limit
        },
        data: data.slice(startIndex, endIndex)
    };
};

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role = 'staff' } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        // Check if email already exists
        const existingStaff = staffsData.find((s: any) => s.email === email);
        if (existingStaff) {
            res.status(409).json({ message: 'Email already exists' });
            return;
        }

        // Create new staff member
        const newStaff = {
            id: staffsData.length + 1,
            name,
            email,
            role,
            password // In production, hash the password before storing
        };

        // Add to existing staff
        staffsData.push(newStaff);

        // Write back to file
        writeFileSync(
            join(__dirname, '../data/staffs.json'),
            JSON.stringify(staffsData, null, 2),
            'utf-8'
        );

        // Generate token
        const token = await Promise.resolve(jwt.sign(
            { id: newStaff.id, email: newStaff.email, role: newStaff.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        ));

        const sanitizedUser = {
            id: newStaff.id,
            name: newStaff.name,
            email: newStaff.email,
            role: newStaff.role
        };

        res.cookie('token', token, { maxAge: 3600000, httpOnly: true });
        res.status(201).json({ 
            message: 'Staff member created successfully',
            token, 
            data: sanitizedUser
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating staff member',
            error: (error as Error).message 
        });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const staff = staffsData.find(
        (s: any) => s.email === email && s.password === password
    );

    if (!staff) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
    }

    const token = await Promise.resolve(jwt.sign(
        { id: staff.id, email: staff.email, role: staff.role },
        JWT_SECRET,
        { expiresIn: '1h' }
    ));

    // add to the cookies the token
    res.cookie('token', token, { maxAge: 3600000, httpOnly: true });

    res.json({ token });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        // Filter out sensitive information
        const sanitizedUsers = staffsData.map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }));

        // Sort users by ID (newest first)
        sanitizedUsers.sort((a: any, b: any) => b.id - a.id);

        const paginatedResult = paginateUsers(page, limit, sanitizedUsers);

        res.json({
            message: 'Users retrieved successfully',
            ...paginatedResult
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching users',
            error: (error as Error).message
        });
    }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const user = staffsData.find((u: any) => u.id === parseInt(userId));

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Filter out sensitive information
        const sanitizedUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.json({
            message: 'User retrieved successfully',
            data: sanitizedUser
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching user',
            error: (error as Error).message
        });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const userIndex = staffsData.findIndex((u: any) => u.id === parseInt(userId));
        if (userIndex === -1) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Prevent deleting the last superAdmin
        const userToDelete = staffsData[userIndex];
        if (userToDelete.role === 'superAdmin') {
            const superAdminCount = staffsData.filter((u: any) => u.role === 'superAdmin').length;
            if (superAdminCount <= 1) {
                res.status(403).json({ message: 'Cannot delete the last super admin' });
                return;
            }
        }

        // Remove user from array
        staffsData.splice(userIndex, 1);

        // Write back to file
        writeFileSync(STAFFS_FILE_PATH, JSON.stringify(staffsData, null, 2), 'utf-8');

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting user',
            error: (error as Error).message
        });
    }
};

