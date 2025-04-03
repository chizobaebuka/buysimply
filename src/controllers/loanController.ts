
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AuthRequest } from '../middlewares/authMiddleware';
import fs from 'fs';

interface LoanApplicant {
    name: string;
    email: string;
    telephone: string;
    totalLoan: string;
}

interface LoanData {
    id: string;
    amount: string;
    maturityDate: string;
    status: 'active' | 'pending';
    applicant: LoanApplicant;
    createdAt: string;
}

interface PaginatedResponse {
    loans: LoanData[];
    pagination: {
        total: number;
        currentPage: number;
        totalPages: number;
        limit: number;
    };
}

const loansData: LoanData[] = JSON.parse(
    readFileSync(join(__dirname, '../data/loans.json'), 'utf-8')
);

const paginateData = (page: number = 1, limit: number = 10, data: LoanData[]): PaginatedResponse => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
        pagination: {
            total: data.length,
            currentPage: page,
            totalPages: Math.ceil(data.length / limit),
            limit: limit
        },
        loans: data.slice(startIndex, endIndex)
    };
};

export const getAllLoans = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        let loans = [...loansData];
        const status = req.query.status as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        if (status) {
            const statusValues = status.replace(/[{}']/g, '').split(',').map(s => s.trim());
            loans = loans.filter(loan => statusValues.includes(loan.status));
        }

        if (req.user?.role === 'staff') {
            loans.map(({ applicant: { totalLoan, ...applicantRest }, ...loanRest }) => ({
                ...loanRest,
                applicant: {
                    ...applicantRest,
                    totalLoan: undefined
                }
            }));
        }

        // Sort loans by createdAt date (newest first)
        loans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const paginatedResult = paginateData(page, limit, loans);
        res.json(paginatedResult);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching loans',
            error: (error as Error).message 
        });
    }
};

export const getLoansByEmail = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userEmail } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const userLoans = loansData.filter(
            loan => loan.applicant.email === userEmail
        );

        // Sort loans by createdAt date (newest first)
        userLoans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const paginatedResult = paginateData(page, limit, userLoans);
        res.json(paginatedResult);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching user loans',
            error: (error as Error).message 
        });
    }
};

export const getExpiredLoans = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const currentDate = new Date();
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const expiredLoans = loansData.filter(loan => {
            const maturityDate = new Date(loan.maturityDate);
            return maturityDate < currentDate;
        });

        // Sort by maturity date (most recently expired first)
        expiredLoans.sort((a, b) => 
            new Date(b.maturityDate).getTime() - new Date(a.maturityDate).getTime()
        );

        const paginatedResult = paginateData(page, limit, expiredLoans);
        res.json(paginatedResult);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching expired loans',
            error: (error as Error).message 
        });
    }
};

export const deleteLoan = async (req: AuthRequest, res: Response): Promise<void> => {
    const { loanId } = req.params;
    const loanIndex = loansData.findIndex((loan: any) => loan.id === loanId);

    if (loanIndex === -1) {
        res.status(404).json({ message: 'Loan not found' });
        return;
    }

    // Remove the loan from the array
    loansData.splice(loanIndex, 1);

    // Write the updated data back to the file
    await fs.promises.writeFile(
        join(__dirname, '../data/loans.json'),
        JSON.stringify(loansData, null, 2),
        'utf-8'
    );

    res.json({ message: 'Loan deleted successfully' });
};

export const createLoan = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { amount, maturityDate, applicant } = req.body;

        // Validate required fields
        if (!amount || !maturityDate || !applicant) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        // Validate applicant data
        if (!applicant.name || !applicant.email || !applicant.telephone) {
            res.status(400).json({ message: 'Missing required applicant information' });
            return;
        }

        // Generate a random 6-digit ID
        const generateId = (): string => {
            return Math.floor(100000 + Math.random() * 900000).toString();
        };

        const newLoan: LoanData = {
            id: generateId(),
            amount: amount.startsWith('₦') ? amount : `₦${amount}`,
            maturityDate: new Date(maturityDate).toISOString().split('T')[0],
            status: 'pending',
            applicant: {
                name: applicant.name,
                email: applicant.email,
                telephone: applicant.telephone,
                totalLoan: applicant.totalLoan || '₦0'
            },
            createdAt: new Date().toISOString().split('T')[0]
        };

        // Add to existing loans
        loansData.push(newLoan);

        // Write back to file
        await fs.promises.writeFile(
            join(__dirname, '../data/loans.json'),
            JSON.stringify(loansData, null, 2),
            'utf-8'
        );

        res.status(201).json({ 
            message: 'Loan created successfully',
            loan: newLoan 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating loan',
            error: (error as Error).message 
        });
    }
};

