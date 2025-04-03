
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const staffsData = JSON.parse(
    readFileSync(join(__dirname, '../data/staffs.json'), 'utf-8')
);

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

