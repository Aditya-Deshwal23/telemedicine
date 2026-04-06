import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../index';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        name: string;
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, config.jwt.secret) as { id: string; email: string; role: string };
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true, name: true, isActive: true },
        });

        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }

        req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token.' });
    }
};
