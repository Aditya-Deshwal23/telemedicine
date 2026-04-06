import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authorize } from '../middleware/roles';

const router = Router();
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/analytics', async (_req, res: Response) => {
    try {
        const [totalUsers, totalDoctors, totalAppointments, totalRevenue, recentAppointments] = await Promise.all([
            prisma.user.count(),
            prisma.doctor.count(),
            prisma.appointment.count(),
            prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
            prisma.appointment.findMany({
                take: 10, orderBy: { createdAt: 'desc' },
                include: { doctor: { include: { user: { select: { name: true } } } }, patient: { include: { user: { select: { name: true } } } } },
            }),
        ]);
        res.json({ totalUsers, totalDoctors, totalAppointments, totalRevenue: totalRevenue._sum.amount || 0, recentAppointments });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/users', async (req, res: Response) => {
    try {
        const { role, page = '1', limit = '20' } = req.query;
        const where: any = {};
        if (role) where.role = role;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        const [users, total] = await Promise.all([
            prisma.user.findMany({ where, skip, take: parseInt(limit as string), select: { id: true, email: true, name: true, phone: true, role: true, isActive: true, isVerified: true, createdAt: true } }),
            prisma.user.count({ where }),
        ]);
        res.json({ users, total });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/doctors', async (req, res: Response) => {
    try {
        const { approved } = req.query;
        const where: any = {};
        if (approved !== undefined) where.isApproved = approved === 'true';
        const doctors = await prisma.doctor.findMany({
            where, include: { user: { select: { name: true, email: true, phone: true, createdAt: true } } }, orderBy: { createdAt: 'desc' },
        });
        res.json(doctors);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/doctors/:id/approve', async (req, res: Response) => {
    try {
        const doctor = await prisma.doctor.update({ where: { id: req.params.id }, data: { isApproved: true } });
        res.json(doctor);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/doctors/:id/reject', async (req, res: Response) => {
    try {
        const doctor = await prisma.doctor.update({ where: { id: req.params.id }, data: { isApproved: false } });
        res.json(doctor);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/users/:id', async (req, res: Response) => {
    try {
        await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
        res.json({ message: 'User deactivated' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/appointments', async (req, res: Response) => {
    try {
        const { status, page = '1', limit = '20' } = req.query;
        const where: any = {};
        if (status) where.status = status;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        const appointments = await prisma.appointment.findMany({
            where, skip, take: parseInt(limit as string), orderBy: { createdAt: 'desc' },
            include: { doctor: { include: { user: { select: { name: true } } } }, patient: { include: { user: { select: { name: true } } } }, payment: true },
        });
        res.json(appointments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
