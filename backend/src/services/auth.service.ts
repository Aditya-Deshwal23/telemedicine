import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { Role } from '@prisma/client';

export class AuthService {
    static generateToken(payload: { id: string; email: string; role: string }): string {
        return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);
    }

    static async register(data: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        role: Role;
        // Doctor fields
        specialization?: string;
        qualification?: string;
        experience?: number;
        fee?: number;
        licenseNumber?: string;
        bio?: string;
    }) {
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) throw new AppError('Email already registered', 400);

        const hashedPassword = await bcrypt.hash(data.password, 12);
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                phone: data.phone,
                role: data.role,
                ...(data.role === 'PATIENT' && {
                    patient: { create: {} },
                }),
                ...(data.role === 'DOCTOR' && {
                    doctor: {
                        create: {
                            specialization: data.specialization!,
                            qualification: data.qualification!,
                            experience: data.experience!,
                            fee: data.fee!,
                            licenseNumber: data.licenseNumber!,
                            bio: data.bio,
                        },
                    },
                }),
            },
            include: { doctor: true, patient: true },
        });

        const token = this.generateToken({ id: user.id, email: user.email, role: user.role });
        return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token };
    }

    static async login(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) throw new AppError('Invalid email or password', 401);
        if (!user.isActive) throw new AppError('Account is deactivated', 403);

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new AppError('Invalid email or password', 401);

        const token = this.generateToken({ id: user.id, email: user.email, role: user.role });
        return {
            user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
            token,
        };
    }

    static async googleAuth(googleId: string, email: string, name: string, avatar?: string) {
        let user = await prisma.user.findUnique({ where: { googleId } });
        if (!user) {
            user = await prisma.user.findUnique({ where: { email } });
            if (user) {
                user = await prisma.user.update({ where: { id: user.id }, data: { googleId } });
            } else {
                user = await prisma.user.create({
                    data: { email, name, googleId, avatar, role: 'PATIENT', isVerified: true, patient: { create: {} } },
                });
            }
        }
        const token = this.generateToken({ id: user.id, email: user.email, role: user.role });
        return { user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar }, token };
    }

    static generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    static async sendOTP(email: string) {
        const otp = this.generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        let user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            await prisma.user.update({ where: { id: user.id }, data: { otp, otpExpiresAt } });
        } else {
            user = await prisma.user.create({
                data: { email, name: email.split('@')[0], otp, otpExpiresAt, role: 'PATIENT', patient: { create: {} } },
            });
        }
        return { otp, userId: user.id }; // OTP sent via email service
    }

    static async verifyOTP(email: string, otp: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new AppError('User not found', 404);
        if (user.otp !== otp) throw new AppError('Invalid OTP', 400);
        if (user.otpExpiresAt && user.otpExpiresAt < new Date()) throw new AppError('OTP expired', 400);

        await prisma.user.update({
            where: { id: user.id },
            data: { otp: null, otpExpiresAt: null, isVerified: true },
        });

        const token = this.generateToken({ id: user.id, email: user.email, role: user.role });
        return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token };
    }

    static async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { doctor: true, patient: true },
        });
        if (!user) throw new AppError('User not found', 404);
        const { password, otp, otpExpiresAt, ...safeUser } = user;
        return safeUser;
    }
}
