import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppointmentService } from '../services/appointment.service';
import { VideoService } from '../services/video.service';

const router = Router();

router.get('/search', async (req, res: Response) => {
    try {
        const { specialization, name, minFee, maxFee, rating, page = '1', limit = '10' } = req.query;
        const where: any = { isApproved: true };
        if (specialization) where.specialization = { contains: specialization as string, mode: 'insensitive' };
        if (minFee || maxFee) where.fee = { ...(minFee && { gte: parseFloat(minFee as string) }), ...(maxFee && { lte: parseFloat(maxFee as string) }) };
        if (rating) where.rating = { gte: parseFloat(rating as string) };
        if (name) where.user = { name: { contains: name as string, mode: 'insensitive' } };

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        const [doctors, total] = await Promise.all([
            prisma.doctor.findMany({
                where, skip, take: parseInt(limit as string),
                include: { user: { select: { name: true, avatar: true, email: true } } },
                orderBy: { rating: 'desc' },
            }),
            prisma.doctor.count({ where }),
        ]);
        res.json({ doctors, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res: Response) => {
    try {
        const doctor = await prisma.doctor.findUnique({
            where: { id: req.params.id },
            include: { user: { select: { name: true, avatar: true, email: true } }, reviews: { include: { author: { select: { name: true, avatar: true } } }, take: 10, orderBy: { createdAt: 'desc' } } },
        });
        if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
        res.json(doctor);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/slots', async (req, res: Response) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ error: 'Date is required' });
        const slots = await AppointmentService.getDoctorSlots(req.params.id, date as string);
        res.json(slots);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const doctor = await prisma.doctor.update({
            where: { userId: req.user!.id },
            data: req.body,
            include: { user: { select: { name: true, avatar: true } } },
        });
        res.json(doctor);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/availability', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { slots } = req.body;
        const doctor = await prisma.doctor.update({
            where: { userId: req.user!.id },
            data: { availableSlots: slots },
        });
        res.json(doctor);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/video-token', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { roomName } = req.body;
        const token = await VideoService.generateToken(roomName, req.user!.name, req.user!.id);
        res.json(token);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

export default router;
